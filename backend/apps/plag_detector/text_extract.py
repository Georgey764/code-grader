"""Extract a single canonical source string from Submission.submitted_file."""

from __future__ import annotations

from apps.assessments.submission_payload import parse_submission_payload

_MAX_CHARS = 500_000


def submission_to_text(submitted_file: str | None) -> str:
    raw = (submitted_file or "").strip()
    if not raw:
        return ""
    try:
        payload = parse_submission_payload(submitted_file)
    except ValueError:
        return raw[:_MAX_CHARS]

    if payload["mode"] == "single":
        return (payload.get("content") or "")[:_MAX_CHARS]

    parts: list[str] = []
    for name in sorted(payload.get("files", {}).keys()):
        body = payload["files"][name]
        parts.append(f"# --- {name} ---\n{body}")
    return "\n\n".join(parts)[:_MAX_CHARS]


def source_as_lines(text: str) -> list[str]:
    if not text:
        return []
    return text.splitlines()
