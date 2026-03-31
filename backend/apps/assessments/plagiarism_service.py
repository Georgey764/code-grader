"""
AST + difflib structural similarity for Python submissions.
Ignores comments and identifier names; compares normalized structure.
"""

from __future__ import annotations

import ast
import difflib
from typing import Optional

MIN_SOURCE_CHARS = 50
SIMILARITY_THRESHOLD = 0.75


class _DropDocstrings(ast.NodeTransformer):
    """Remove expression docstrings from Module, ClassDef, and FunctionDef bodies."""

    def _strip_leading_docstring(self, body: list) -> list:
        if not body:
            return body
        first = body[0]
        if isinstance(first, ast.Expr) and isinstance(first.value, ast.Constant):
            if isinstance(first.value.value, str):
                return body[1:]
        return body

    def visit_Module(self, node: ast.Module) -> ast.Module:
        self.generic_visit(node)
        node.body = self._strip_leading_docstring(node.body)
        return node

    def visit_ClassDef(self, node: ast.ClassDef) -> ast.ClassDef:
        self.generic_visit(node)
        node.body = self._strip_leading_docstring(node.body)
        return node

    def visit_FunctionDef(self, node: ast.FunctionDef) -> ast.FunctionDef:
        self.generic_visit(node)
        node.body = self._strip_leading_docstring(node.body)
        return node

    def visit_AsyncFunctionDef(self, node: ast.AsyncFunctionDef) -> ast.AsyncFunctionDef:
        self.generic_visit(node)
        node.body = self._strip_leading_docstring(node.body)
        return node


class _NormalizeIdentifiers(ast.NodeTransformer):
    """Replace all Name and arg identifiers with a single placeholder for structure-only comparison."""

    def visit_Name(self, node: ast.Name) -> ast.Name:
        return ast.copy_location(ast.Name(id="N", ctx=node.ctx), node)

    def visit_arg(self, node: ast.arg) -> ast.arg:
        ann = self.visit(node.annotation) if node.annotation else None
        return ast.arg(arg="N", annotation=ann)

    def visit_Attribute(self, node: ast.Attribute) -> ast.Attribute:
        self.generic_visit(node)
        return ast.copy_location(
            ast.Attribute(value=node.value, attr="N", ctx=node.ctx), node
        )


def _parse_and_normalize(source: str) -> Optional[str]:
    if len(source.strip()) < MIN_SOURCE_CHARS:
        return None
    try:
        tree = ast.parse(source)
    except SyntaxError:
        return None
    tree = _DropDocstrings().visit(tree)
    tree = _NormalizeIdentifiers().visit(tree)
    ast.fix_missing_locations(tree)
    try:
        return ast.unparse(tree)
    except Exception:
        return ast.dump(tree, include_attributes=False)


def structural_similarity_ratio(code_a: str, code_b: str) -> float:
    """
    Returns a ratio in [0.0, 1.0] using difflib on normalized AST text.
    """
    na = _parse_and_normalize(code_a or "")
    nb = _parse_and_normalize(code_b or "")
    if na is None or nb is None:
        return 0.0
    return difflib.SequenceMatcher(None, na, nb).ratio()


def normalized_source_lines(source: str) -> Optional[list[str]]:
    """Lines of normalized source for diff display; None if too short or invalid."""
    text = _parse_and_normalize(source or "")
    if text is None:
        return None
    return text.splitlines()


def structural_diff_line_highlights(
    code_a: str, code_b: str
) -> Optional[dict]:
    """
    Align normalized line lists and mark indices that belong to matching blocks
    (structurally identical lines in normalized form).
    """
    la = normalized_source_lines(code_a or "")
    lb = normalized_source_lines(code_b or "")
    if la is None or lb is None:
        return None
    sm = difflib.SequenceMatcher(a=la, b=lb)
    left_hi: set[int] = set()
    right_hi: set[int] = set()
    for block in sm.get_matching_blocks():
        for k in range(block.size):
            left_hi.add(block.a + k)
            right_hi.add(block.b + k)
    return {
        "left_normalized_lines": la,
        "right_normalized_lines": lb,
        "highlight_left_indices": sorted(left_hi),
        "highlight_right_indices": sorted(right_hi),
    }


def ordered_submission_pair(sub_a, sub_b):
    """Return (submission_a, submission_b) with str(id_a) < str(id_b)."""
    sa, sb = str(sub_a.id), str(sub_b.id)
    if sa <= sb:
        return sub_a, sub_b
    return sub_b, sub_a
