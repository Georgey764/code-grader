"""
Winnowing-based fingerprinting for plagiarism detection.

Reference: "Winnowing: Local Algorithms for Document Fingerprinting"
           (Schleimer, Wilkerson, Aiken — SIGMOD 2003)

Steps:
  1. Build k-grams (sliding window of k tokens joined into strings).
  2. Hash each k-gram.
  3. Slide a window of size w over the hashes and pick the minimum hash
     in each window (with a tie-breaking rule to avoid duplicates).
  4. The resulting set of selected hashes is the document's fingerprint.
"""

from __future__ import annotations


def _kgrams(tokens: list[str], k: int):
    """Yield consecutive k-grams as joined strings."""
    for i in range(len(tokens) - k + 1):
        yield " ".join(tokens[i : i + k])


def _rolling_hash(s: str) -> int:
    """Simple polynomial rolling hash (deterministic, fast)."""
    h = 0
    base = 31
    mod = (1 << 61) - 1  # Mersenne prime
    for ch in s:
        h = (h * base + ord(ch)) % mod
    return h


def winnow(tokens: list[str], k: int = 5, w: int = 4) -> set[int]:
    """
    Return the winnowed fingerprint of a token list.

    Parameters
    ----------
    tokens : normalized token sequence from the tokenizer
    k      : k-gram size  (default 5 — captures 5-token patterns)
    w      : window size  (default 4 — guarantees any run of w+k-1 tokens
                           contains at least one selected hash)

    Returns
    -------
    A set of integer hashes representing the document fingerprint.
    """
    if len(tokens) < k:
        # File is too short for k-grams — fall back to hashing all tokens
        return {_rolling_hash(t) for t in tokens}

    hashes = [_rolling_hash(kg) for kg in _kgrams(tokens, k)]

    if len(hashes) < w:
        return set(hashes)

    fingerprint: set[int] = set()
    prev_min_idx = -1

    for i in range(len(hashes) - w + 1):
        window = hashes[i : i + w]
        # Pick the rightmost minimum (tie-breaking rule from the paper)
        min_val = min(window)
        min_idx = i + (w - 1 - window[::-1].index(min_val))  # rightmost min

        if min_idx != prev_min_idx:
            fingerprint.add(min_val)
            prev_min_idx = min_idx

    return fingerprint
