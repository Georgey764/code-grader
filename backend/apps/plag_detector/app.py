"""
Flask web app for PlagDetector.
Run with:  python3 app.py
"""

import difflib
import os
import re
import tempfile
from flask import Flask, render_template, request, jsonify

from detector.tokenizer import tokenize_file, detect_language
from detector.fingerprint import winnow
from detector.similarity import compute_similarity

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 2 * 1024 * 1024  # 2 MB upload limit

ALLOWED_EXTENSIONS = {".py", ".java"}


def _allowed(filename: str) -> bool:
    return any(filename.endswith(ext) for ext in ALLOWED_EXTENSIONS)


_KEYWORDS = {
    # Python keywords
    "false",
    "none",
    "true",
    "and",
    "as",
    "assert",
    "async",
    "await",
    "break",
    "class",
    "continue",
    "def",
    "del",
    "elif",
    "else",
    "except",
    "finally",
    "for",
    "from",
    "global",
    "if",
    "import",
    "in",
    "is",
    "lambda",
    "nonlocal",
    "not",
    "or",
    "pass",
    "raise",
    "return",
    "try",
    "while",
    "with",
    "yield",
    # Java keywords
    "abstract",
    "boolean",
    "byte",
    "case",
    "catch",
    "char",
    "const",
    "default",
    "do",
    "double",
    "enum",
    "extends",
    "final",
    "float",
    "goto",
    "implements",
    "instanceof",
    "int",
    "interface",
    "long",
    "native",
    "new",
    "package",
    "private",
    "protected",
    "public",
    "short",
    "static",
    "strictfp",
    "super",
    "switch",
    "synchronized",
    "this",
    "throw",
    "throws",
    "transient",
    "void",
    "volatile",
}

_IDENT_RE = re.compile(r"[A-Za-z_]\w*")
_COMMENT_RE = re.compile(r"(//[^\n]*|#[^\n]*|/\*.*?\*/)", re.DOTALL)
_STR_RE = re.compile(r'"(?:[^"\\]|\\.)*"|\'(?:[^\'\\]|\\.)*\'')
_NUM_RE = re.compile(r"\b\d+(?:\.\d+)?\b")


def _norm_line(line: str) -> str:
    """
    Structurally normalize a single source line so that code which is
    logically identical but uses different identifiers/literals will match.
      - Strip comments
      - Replace string/number literals with placeholders
      - Replace non-keyword identifiers with '_'
      - Collapse whitespace
    """
    line = line.strip()
    line = _COMMENT_RE.sub("", line)
    line = _STR_RE.sub("S", line)
    line = _NUM_RE.sub("N", line)
    line = _IDENT_RE.sub(
        lambda m: m.group(0) if m.group(0).lower() in _KEYWORDS else "_", line
    )
    return " ".join(line.lower().split())


def find_matching_lines(source_a: str, source_b: str, min_block: int = 2) -> dict:
    """
    Use SequenceMatcher on structurally-normalized lines to find matching blocks.
    Returns the raw lines of each file plus per-line group assignments.
    Group index -1 means the line has no match.
    """
    lines_a = source_a.splitlines()
    lines_b = source_b.splitlines()

    norm_a = [_norm_line(l) for l in lines_a]
    norm_b = [_norm_line(l) for l in lines_b]

    matcher = difflib.SequenceMatcher(None, norm_a, norm_b, autojunk=False)

    group_a = [-1] * len(lines_a)
    group_b = [-1] * len(lines_b)
    group_idx = 0

    for i, j, n in matcher.get_matching_blocks():
        if n >= min_block:
            for k in range(n):
                group_a[i + k] = group_idx
                group_b[j + k] = group_idx
            group_idx += 1

    return {
        "lines_a": lines_a,
        "lines_b": lines_b,
        "groups_a": group_a,
        "groups_b": group_b,
        "total_groups": group_idx,
    }


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/compare", methods=["POST"])
def compare():
    file_a = request.files.get("file_a")
    file_b = request.files.get("file_b")

    if not file_a or not file_b:
        return jsonify(error="Both files are required."), 400

    if not _allowed(file_a.filename):
        return jsonify(error=f"File A '{file_a.filename}' must be .py or .java"), 400
    if not _allowed(file_b.filename):
        return jsonify(error=f"File B '{file_b.filename}' must be .py or .java"), 400

    try:
        k = int(request.form.get("kgram", 5))
        w = int(request.form.get("window", 4))
        if not (2 <= k <= 20) or not (2 <= w <= 20):
            raise ValueError
    except (ValueError, TypeError):
        return jsonify(
            error="k-gram and window must be integers between 2 and 20."
        ), 400

    # Save uploads to temp files (preserving the original extension)
    suffix_a = os.path.splitext(file_a.filename)[1]
    suffix_b = os.path.splitext(file_b.filename)[1]

    path_a = path_b = None
    try:
        with (
            tempfile.NamedTemporaryFile(suffix=suffix_a, delete=False) as tmp_a,
            tempfile.NamedTemporaryFile(suffix=suffix_b, delete=False) as tmp_b,
        ):
            file_a.save(tmp_a.name)
            file_b.save(tmp_b.name)
            path_a, path_b = tmp_a.name, tmp_b.name

        lang_a = detect_language(path_a)
        lang_b = detect_language(path_b)

        with open(path_a, encoding="utf-8", errors="replace") as f:
            source_a = f.read()
        with open(path_b, encoding="utf-8", errors="replace") as f:
            source_b = f.read()

        tokens_a = tokenize_file(path_a)
        tokens_b = tokenize_file(path_b)
        fp_a = winnow(tokens_a, k=k, w=w)
        fp_b = winnow(tokens_b, k=k, w=w)
        result = compute_similarity(fp_a, fp_b, tokens_a, tokens_b)
        diff = find_matching_lines(source_a, source_b)

    except ValueError as exc:
        return jsonify(error=str(exc)), 400
    except Exception as exc:
        return jsonify(error=f"Analysis failed: {exc}"), 500
    finally:
        for p in (path_a, path_b):
            if p:
                try:
                    os.unlink(p)
                except Exception:
                    pass

    language = lang_a if lang_a == lang_b else f"{lang_a}/{lang_b}"

    return jsonify(
        verdict=result.verdict,
        score=result.score,
        jaccard=result.jaccard,
        token_overlap=result.token_overlap,
        shared_fingerprints=result.shared_fingerprints,
        tokens_a=result.tokens_a,
        tokens_b=result.tokens_b,
        total_fingerprints_a=result.total_fingerprints_a,
        total_fingerprints_b=result.total_fingerprints_b,
        language=language,
        file_a=file_a.filename,
        file_b=file_b.filename,
        diff=diff,
    )


if __name__ == "__main__":
    print("Starting PlagDetector at http://127.0.0.1:5000")
    app.run(debug=True, port=5000)
