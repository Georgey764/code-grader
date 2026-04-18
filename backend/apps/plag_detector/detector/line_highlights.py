"""
Map structurally identical k-grams to source line numbers for side-by-side highlighting.
"""

from __future__ import annotations

from .fingerprint import _rolling_hash


def highlight_lines_from_shared_kgrams(
    tokens_lines_a: list[tuple[str, int]],
    tokens_lines_b: list[tuple[str, int]],
    k: int = 5,
) -> tuple[set[int], set[int]]:
    """
    Lines in A and B that participate in at least one identical k-gram (same normalized
    token sequence and thus same hash).
    """
    if k < 2:
        k = 2

    def build_hash_to_lines(
        tl: list[tuple[str, int]],
    ) -> dict[int, set[int]]:
        toks = [t[0] for t in tl]
        lines_of = [t[1] for t in tl]
        m: dict[int, set[int]] = {}
        if len(toks) < k:
            return m
        for i in range(len(toks) - k + 1):
            kg = " ".join(toks[i : i + k])
            h = _rolling_hash(kg)
            line_set = set(lines_of[i : i + k])
            m.setdefault(h, set()).update(line_set)
        return m

    ma = build_hash_to_lines(tokens_lines_a)
    mb = build_hash_to_lines(tokens_lines_b)
    shared_hashes = set(ma) & set(mb)

    la: set[int] = set()
    lb: set[int] = set()
    for h in shared_hashes:
        la |= ma[h]
        lb |= mb[h]
    return la, lb
