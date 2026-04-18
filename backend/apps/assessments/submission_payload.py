"""
Multi-file submissions are stored as JSON in Submission.submitted_file:

  {"v": 1, "files": {"solution.py": "...", "util.py": "..."}, "entry": "solution.py"}

- Python: optional `entry` is the .py filename to execute (stdin wrapper applied there only).
  If omitted: a single .py file is used; otherwise `main.py` (any casing) if present, else the
  first `.py` when sorted case-insensitively.
- Java: optional `entry` is the JVM class name to run (e.g. "Main").
  If omitted: a single .java file is inferred from source; otherwise `Main.java`, else a file
  containing `public static void main`, else the first `.java` when sorted case-insensitively.

Legacy single-file submissions remain a plain string (source code).
"""

from __future__ import annotations

import json
import os
import re
from typing import Any

MULTI_FILE_VERSION = 1

_FILENAME_RE = re.compile(r"^[\w\-.]+\.(py|java)$", re.IGNORECASE)
def sanitize_upload_filename(name: str) -> str:
    if not name or not isinstance(name, str):
        raise ValueError("Invalid filename")
    stripped = name.strip()
    base = os.path.basename(stripped)
    if base != stripped:
        raise ValueError("Paths are not allowed; use names like main.py")
    if ".." in base or "/" in base or "\\" in base:
        raise ValueError("Invalid filename")
    if not _FILENAME_RE.match(base):
        raise ValueError(
            f"Unsupported filename {base!r}. Use letters, digits, hyphen, dot "
            "(e.g. main.py, Main.java)."
        )
    return base


def parse_submission_payload(submitted_file: str | None) -> dict[str, Any]:
    """
    Returns:
      - {"mode": "single", "content": str}
      - {"mode": "multi", "v": int, "files": dict[str, str], "entry": str | None}
        entry is Python filename (endswith .py) or Java class name — resolved in services.
    """
    raw = (submitted_file or "").strip()
    if not raw:
        return {"mode": "single", "content": ""}

    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        return {"mode": "single", "content": raw}

    if not isinstance(data, dict):
        return {"mode": "single", "content": raw}

    files = data.get("files")
    if not isinstance(files, dict) or not files:
        return {"mode": "single", "content": raw}

    normalized: dict[str, str] = {}
    for key, value in files.items():
        sk = sanitize_upload_filename(key)
        if not isinstance(value, str):
            raise ValueError("Each file entry must be a string of source code")
        normalized[sk] = value

    entry = data.get("entry")
    if entry is not None and entry != "":
        entry = str(entry).strip()
    else:
        entry = None

    return {
        "mode": "multi",
        "v": int(data.get("v", MULTI_FILE_VERSION)),
        "files": normalized,
        "entry": entry,
    }
