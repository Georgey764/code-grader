"""
Formats and prints the plagiarism detection report.
"""

from __future__ import annotations
from .similarity import SimilarityResult

# ANSI colour codes (disabled automatically on non-TTY via print)
_RED = "\033[91m"
_YELLOW = "\033[93m"
_GREEN = "\033[92m"
_CYAN = "\033[96m"
_BOLD = "\033[1m"
_RESET = "\033[0m"


def _verdict_colour(verdict: str) -> str:
    if "HIGHLY" in verdict:
        return _RED
    if "POSSIBLY" in verdict:
        return _YELLOW
    if "SOME" in verdict:
        return _CYAN
    return _GREEN


def _bar(value: float, width: int = 40) -> str:
    """Render a simple ASCII progress bar for a 0–100 value."""
    filled = int(round(value / 100 * width))
    return "[" + "#" * filled + "-" * (width - filled) + "]"


def print_report(
    file_a: str,
    file_b: str,
    result: SimilarityResult,
    lang: str,
) -> None:
    colour = _verdict_colour(result.verdict)
    sep = "=" * 60

    print(f"\n{_BOLD}{sep}{_RESET}")
    print(f"{_BOLD}  PLAGIARISM DETECTION REPORT{_RESET}")
    print(sep)
    print(f"  Language : {lang.upper()}")
    print(f"  File A   : {file_a}")
    print(f"  File B   : {file_b}")
    print(sep)
    print(f"\n  Tokens (A / B)        : {result.tokens_a} / {result.tokens_b}")
    print(
        f"  Fingerprints (A / B)  : {result.total_fingerprints_a} / {result.total_fingerprints_b}"
    )
    print(f"  Shared fingerprints   : {result.shared_fingerprints}")
    print()
    print(f"  Fingerprint Similarity: {result.jaccard:>6.2f}%  {_bar(result.jaccard)}")
    print(
        f"  Token Overlap         : {result.token_overlap:>6.2f}%  {_bar(result.token_overlap)}"
    )
    print(f"  Combined Score        : {result.score:>6.2f}%  {_bar(result.score)}")
    print()
    print(f"  {_BOLD}Verdict: {colour}{result.verdict}{_RESET}")
    print(f"\n{sep}\n")


def print_batch_report(results: list[dict]) -> None:
    """Print a summary table for batch (directory) comparisons."""
    sep = "=" * 80
    print(f"\n{_BOLD}{sep}{_RESET}")
    print(f"{_BOLD}  BATCH PLAGIARISM REPORT{_RESET}")
    print(sep)
    header = f"  {'File A':<25} {'File B':<25} {'Score':>7}  Verdict"
    print(header)
    print("-" * 80)

    # Sort by score descending
    for r in sorted(results, key=lambda x: x["score"], reverse=True):
        colour = _verdict_colour(r["verdict"])
        a = r["file_a"].split("/")[-1]
        b = r["file_b"].split("/")[-1]
        score = r["score"]
        verdict = r["verdict"]
        print(f"  {a:<25} {b:<25} {score:>6.1f}%  {colour}{verdict}{_RESET}")

    print(f"{sep}\n")
