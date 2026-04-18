"""
Tokenizers that retain source line numbers for plagiarism highlighting.
"""

from __future__ import annotations

import io
import keyword
import re
import tokenize

from .tokenizer import JAVA_KEYWORDS, _JAVA_TOKEN_RE

PYTHON_KEYWORDS = set(keyword.kwlist)


def tokenize_python_with_lines(source: str) -> list[tuple[str, int]]:
    tokens: list[tuple[str, int]] = []
    try:
        gen = tokenize.generate_tokens(io.StringIO(source).readline)
        prev_token = None
        for tok in gen:
            tok_type = tok.type
            tok_str = tok.string
            line = tok.start[0]

            if tok_type in (
                tokenize.COMMENT,
                tokenize.NL,
                tokenize.NEWLINE,
                tokenize.ENCODING,
                tokenize.ENDMARKER,
            ):
                continue

            if tok_type == tokenize.NAME:
                if tok_str in PYTHON_KEYWORDS:
                    tokens.append((tok_str, line))
                elif prev_token == "def":
                    tokens.append(("FUNC_DEF", line))
                elif prev_token == "class":
                    tokens.append(("CLASS_DEF", line))
                else:
                    tokens.append(("VAR", line))
            elif tok_type == tokenize.STRING:
                tokens.append(("STR_LIT", line))
            elif tok_type == tokenize.NUMBER:
                tokens.append(("NUM_LIT", line))
            elif tok_type == tokenize.OP:
                tokens.append((tok_str, line))
            else:
                tokens.append((tok_str, line))

            prev_token = tok_str if tok_type == tokenize.NAME else tok_str

    except tokenize.TokenError:
        pass

    return tokens


def tokenize_java_with_lines(source: str) -> list[tuple[str, int]]:
    tokens: list[tuple[str, int]] = []
    prev = None

    for m in _JAVA_TOKEN_RE.finditer(source):
        tok = m.group(0)
        line = source.count("\n", 0, m.start()) + 1

        if tok.startswith("//") or tok.startswith("/*"):
            continue

        if tok.startswith('"') or tok.startswith("'"):
            tokens.append(("STR_LIT", line))
            prev = "STR_LIT"
            continue

        if re.match(r"^[0-9]", tok):
            tokens.append(("NUM_LIT", line))
            prev = "NUM_LIT"
            continue

        if re.match(r"^[A-Za-z_]", tok):
            if tok in JAVA_KEYWORDS:
                tokens.append((tok, line))
                prev = tok
            elif prev == "class":
                tokens.append(("CLASS_DEF", line))
                prev = "CLASS_DEF"
            elif prev in (
                "void",
                "int",
                "double",
                "float",
                "long",
                "boolean",
                "char",
                "byte",
                "short",
                "String",
            ):
                tokens.append(("DECL_NAME", line))
                prev = "DECL_NAME"
            else:
                tokens.append(("VAR", line))
                prev = "VAR"
            continue

        tokens.append((tok, line))
        prev = tok

    return tokens


def tokenize_source_with_lines(source: str, lang: str) -> list[tuple[str, int]]:
    lang = (lang or "python").lower()
    if lang == "java":
        return tokenize_java_with_lines(source)
    return tokenize_python_with_lines(source)
