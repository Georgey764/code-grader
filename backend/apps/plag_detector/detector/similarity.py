"""
Similarity metrics used by the plagiarism detector.
"""

from __future__ import annotations
from dataclasses import dataclass


@dataclass
class SimilarityResult:
    jaccard: float  # fingerprint overlap (structural similarity)
    token_overlap: float  # raw token-level overlap
    score: float  # weighted combined score (0–100 %)
    verdict: str  # human-readable verdict
    shared_fingerprints: int
    total_fingerprints_a: int
    total_fingerprints_b: int
    tokens_a: int
    tokens_b: int


def jaccard(set_a: set, set_b: set) -> float:
    """Jaccard similarity: |A ∩ B| / |A ∪ B|"""
    if not set_a and not set_b:
        return 1.0
    intersection = len(set_a & set_b)
    union = len(set_a | set_b)
    return intersection / union if union else 0.0


def token_overlap(tokens_a: list[str], tokens_b: list[str]) -> float:
    """
    Containment-style overlap: what fraction of the shorter file's
    token multiset appears in the longer file.
    """
    from collections import Counter

    if not tokens_a or not tokens_b:
        return 0.0
    ca, cb = Counter(tokens_a), Counter(tokens_b)
    shared = sum((ca & cb).values())
    shorter = min(sum(ca.values()), sum(cb.values()))
    return shared / shorter if shorter else 0.0


def compute_similarity(
    fp_a: set[int],
    fp_b: set[int],
    tokens_a: list[str],
    tokens_b: list[str],
) -> SimilarityResult:
    """
    Combine fingerprint Jaccard and token overlap into a single score
    and produce a verdict.
    """
    j = jaccard(fp_a, fp_b)
    tov = token_overlap(tokens_a, tokens_b)

    # Weighted combination: fingerprint similarity is more reliable
    combined = 0.65 * j + 0.35 * tov
    score = round(combined * 100, 2)

    if score >= 75:
        verdict = "HIGHLY LIKELY PLAGIARISED"
    elif score >= 50:
        verdict = "POSSIBLY PLAGIARISED"
    elif score >= 25:
        verdict = "SOME SIMILARITY"
    else:
        verdict = "LIKELY ORIGINAL"

    return SimilarityResult(
        jaccard=round(j * 100, 2),
        token_overlap=round(tov * 100, 2),
        score=score,
        verdict=verdict,
        shared_fingerprints=len(fp_a & fp_b),
        total_fingerprints_a=len(fp_a),
        total_fingerprints_b=len(fp_b),
        tokens_a=len(tokens_a),
        tokens_b=len(tokens_b),
    )
