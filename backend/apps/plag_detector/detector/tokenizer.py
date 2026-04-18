"""
Language-specific tokenizers for plagiarism detection.

Normalizes code by:
- Removing comments
- Replacing identifier names with generic tokens (VAR, FUNC, etc.)
- Preserving structural tokens (keywords, operators, punctuation)
"""

import re
import tokenize
import io
import keyword


def detect_language(filepath: str) -> str:
    """Detect language from file extension."""
    if filepath.endswith(".py"):
        return "python"
    elif filepath.endswith(".java"):
        return "java"
    else:
        raise ValueError(
            f"Unsupported file type: {filepath}. Only .py and .java are supported."
        )


# ── Python tokenizer ──────────────────────────────────────────────────────────

PYTHON_KEYWORDS = set(keyword.kwlist)


def tokenize_python(source: str) -> list[str]:
    """
    Tokenize Python source into a normalized token sequence.
    Identifiers that are not keywords are replaced with their token type
    (NAME → VAR for variables, function names stay as FUNC when preceded by 'def').
    """
    tokens = []
    try:
        gen = tokenize.generate_tokens(io.StringIO(source).readline)
        prev_token = None
        for tok in gen:
            tok_type = tok.type
            tok_str = tok.string

            # Skip comments and blank lines
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
                    tokens.append(tok_str)  # keep keyword as-is
                elif prev_token == "def":
                    tokens.append("FUNC_DEF")  # function name after 'def'
                elif prev_token == "class":
                    tokens.append("CLASS_DEF")  # class name after 'class'
                else:
                    tokens.append("VAR")  # any other identifier
            elif tok_type == tokenize.STRING:
                tokens.append("STR_LIT")
            elif tok_type == tokenize.NUMBER:
                tokens.append("NUM_LIT")
            elif tok_type == tokenize.OP:
                tokens.append(tok_str)
            else:
                tokens.append(tok_str)

            prev_token = tok_str if tok_type == tokenize.NAME else tok_str

    except tokenize.TokenError:
        pass  # handle incomplete / broken source gracefully

    return tokens


# ── Java tokenizer ────────────────────────────────────────────────────────────

JAVA_KEYWORDS = {
    "abstract",
    "assert",
    "boolean",
    "break",
    "byte",
    "case",
    "catch",
    "char",
    "class",
    "const",
    "continue",
    "default",
    "do",
    "double",
    "else",
    "enum",
    "extends",
    "final",
    "finally",
    "float",
    "for",
    "goto",
    "if",
    "implements",
    "import",
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
    "return",
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
    "try",
    "void",
    "volatile",
    "while",
    "true",
    "false",
    "null",
    "String",
    "System",
    "out",
    "println",
    "print",
}

_JAVA_TOKEN_RE = re.compile(
    r"//[^\n]*"  # single-line comment
    r"|/\*.*?\*/"  # block comment
    r'|"(?:[^"\\]|\\.)*"'  # string literal
    r"|'(?:[^'\\]|\\.)*'"  # char literal
    r"|[0-9]+(?:\.[0-9]+)?[lLfFdD]?"  # numeric literal
    r"|[A-Za-z_]\w*"  # identifier / keyword
    r"|[+\-*/%&|^~<>=!]=?|[(){}\[\];,.]|->|::|\+\+|--",  # operators & punctuation
    re.DOTALL,
)


def tokenize_java(source: str) -> list[str]:
    """
    Tokenize Java source into a normalized token sequence.
    """
    raw_tokens = _JAVA_TOKEN_RE.findall(source)
    tokens = []
    prev = None

    for tok in raw_tokens:
        # Skip comments
        if tok.startswith("//") or tok.startswith("/*"):
            continue

        # String / char literals
        if tok.startswith('"') or tok.startswith("'"):
            tokens.append("STR_LIT")
            prev = "STR_LIT"
            continue

        # Numeric literals
        if re.match(r"^[0-9]", tok):
            tokens.append("NUM_LIT")
            prev = "NUM_LIT"
            continue

        # Identifier or keyword
        if re.match(r"^[A-Za-z_]", tok):
            if tok in JAVA_KEYWORDS:
                tokens.append(tok)
                prev = tok
            elif prev == "class":
                tokens.append("CLASS_DEF")
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
                # Could be a method or variable declaration — peek at next token
                # We mark it conservatively as FUNC_DEF; post-processing not needed
                # for fingerprinting purposes.
                tokens.append("DECL_NAME")
                prev = "DECL_NAME"
            else:
                tokens.append("VAR")
                prev = "VAR"
            continue

        # Operator / punctuation — keep as-is
        tokens.append(tok)
        prev = tok

    return tokens


# ── Public API ────────────────────────────────────────────────────────────────


def tokenize_file(filepath: str) -> list[str]:
    """Read a file and return its normalized token list."""
    with open(filepath, "r", encoding="utf-8", errors="replace") as f:
        source = f.read()

    lang = detect_language(filepath)
    if lang == "python":
        return tokenize_python(source)
    else:
        return tokenize_java(source)
