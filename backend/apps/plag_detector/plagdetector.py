#!/usr/bin/env python3
"""
PlagDetector — Code Plagiarism Detector for Python and Java
============================================================

Usage
-----
  # Compare two files
  python plagdetector.py file_a.py file_b.py

  # Compare all files in a directory against each other
  python plagdetector.py --dir samples/python

  # Adjust sensitivity (k-gram size and window size)
  python plagdetector.py file_a.java file_b.java --kgram 6 --window 5
"""

import argparse
import itertools
import os
import sys
from pathlib import Path

from detector.tokenizer import tokenize_file, detect_language
from detector.fingerprint import winnow
from detector.similarity import compute_similarity
from detector.report import print_report, print_batch_report


def compare_files(
    path_a: str,
    path_b: str,
    k: int,
    w: int,
    silent: bool = False,
) -> dict:
    """
    Compare two source files and return the similarity result as a dict.
    Prints a report unless silent=True.
    """
    lang_a = detect_language(path_a)
    lang_b = detect_language(path_b)

    if lang_a != lang_b:
        print(
            f"[Warning] Language mismatch: {path_a} is {lang_a}, "
            f"{path_b} is {lang_b}. Comparing anyway.",
            file=sys.stderr,
        )

    tokens_a = tokenize_file(path_a)
    tokens_b = tokenize_file(path_b)

    fp_a = winnow(tokens_a, k=k, w=w)
    fp_b = winnow(tokens_b, k=k, w=w)

    result = compute_similarity(fp_a, fp_b, tokens_a, tokens_b)

    if not silent:
        print_report(path_a, path_b, result, lang_a)

    return {
        "file_a": path_a,
        "file_b": path_b,
        "score": result.score,
        "verdict": result.verdict,
        "jaccard": result.jaccard,
        "token_overlap": result.token_overlap,
        "result": result,
    }


def compare_directory(directory: str, k: int, w: int) -> None:
    """Compare every pair of supported files in a directory."""
    exts = {".py", ".java"}
    files = [
        str(p) for p in Path(directory).iterdir() if p.suffix in exts and p.is_file()
    ]

    if len(files) < 2:
        print(
            f"[Error] Need at least 2 source files in '{directory}'.", file=sys.stderr
        )
        sys.exit(1)

    results = []
    pairs = list(itertools.combinations(sorted(files), 2))

    print(f"\nComparing {len(files)} files → {len(pairs)} pair(s)...\n")

    for a, b in pairs:
        try:
            r = compare_files(a, b, k=k, w=w, silent=True)
            results.append(r)
        except Exception as exc:
            print(f"[Warning] Could not compare {a} vs {b}: {exc}", file=sys.stderr)

    print_batch_report(results)

    # Print detailed reports for pairs that exceed the threshold
    flagged = [r for r in results if r["score"] >= 50]
    if flagged:
        print(f"\nDetailed reports for {len(flagged)} flagged pair(s):\n")
        for r in flagged:
            lang = detect_language(r["file_a"])
            print_report(r["file_a"], r["file_b"], r["result"], lang)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="PlagDetector — Plagiarism detector for Python and Java code.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )

    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument(
        "files",
        nargs="?",
        metavar="FILE",
        help="First source file (use with a second positional argument).",
    )
    group.add_argument(
        "--dir",
        metavar="DIRECTORY",
        help="Compare all .py / .java files in this directory against each other.",
    )

    parser.add_argument(
        "file_b",
        nargs="?",
        metavar="FILE_B",
        help="Second source file.",
    )
    parser.add_argument(
        "--kgram",
        "-k",
        type=int,
        default=5,
        metavar="K",
        help="k-gram size for fingerprinting (default: 5).",
    )
    parser.add_argument(
        "--window",
        "-w",
        type=int,
        default=4,
        metavar="W",
        help="Window size for winnowing (default: 4).",
    )

    args = parser.parse_args()

    # Two-file comparison mode
    if args.files:
        if not args.file_b:
            parser.error("Provide two file paths: plagdetector.py FILE_A FILE_B")
        for path in (args.files, args.file_b):
            if not os.path.isfile(path):
                print(f"[Error] File not found: {path}", file=sys.stderr)
                sys.exit(1)
        compare_files(args.files, args.file_b, k=args.kgram, w=args.window)

    # Directory batch mode
    elif args.dir:
        if not os.path.isdir(args.dir):
            print(f"[Error] Directory not found: {args.dir}", file=sys.stderr)
            sys.exit(1)
        compare_directory(args.dir, k=args.kgram, w=args.window)


if __name__ == "__main__":
    main()
