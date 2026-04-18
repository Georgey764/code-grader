"""
Run student code locally via subprocess.
Multi-file: all sources share a working directory; one Python file or Java class is executed.
"""

from __future__ import annotations

import re
import subprocess
import sys
import tempfile
import time
from pathlib import Path

from apps.assessments.submission_payload import parse_submission_payload, sanitize_upload_filename

_PYTHON_INPUT_WRAPPER_PREFIX = """import builtins

_original_input = builtins.input

def silent_input(prompt=""):
    return _original_input()

builtins.input = silent_input
"""

# Single-file text submissions are stored without a name; use a stable internal name.
_SINGLE_PY_NAME = "submission.py"
PY_TIMEOUT = 15
JAVA_TIMEOUT = 30
_JAVA_CLASS_RE = re.compile(r"^[A-Za-z_][A-Za-z0-9_]*$")


def _all_tests_error(test_cases, message):
    return [
        {
            "test_case_id": tc.get("id"),
            "stdout": "",
            "stderr": message,
            "duration": 0,
            "exit_code": 1,
            "is_success": False,
        }
        for tc in test_cases
    ]


def _strip_java_package(code: str) -> str:
    return re.sub(r"^\s*package\s+[\w\.]+;\s*", "", code, flags=re.MULTILINE)


def _java_main_class_from_source(content: str) -> str:
    cleaned = _strip_java_package(content)
    m = re.search(r"public\s+class\s+(\w+)", cleaned)
    if not m:
        m = re.search(r"class\s+(\w+)", cleaned)
    return m.group(1) if m else "Main"


def _materialize_python_single(workdir: str, content: str) -> str:
    body = f"{_PYTHON_INPUT_WRAPPER_PREFIX}\n{content}"
    Path(workdir, _SINGLE_PY_NAME).write_text(body, encoding="utf-8")
    return _SINGLE_PY_NAME


def _materialize_python_multi(
    workdir: str, files: dict[str, str], entry_py: str
) -> None:
    for fname, body in files.items():
        if fname == entry_py:
            Path(workdir, fname).write_text(
                f"{_PYTHON_INPUT_WRAPPER_PREFIX}\n{body}", encoding="utf-8"
            )
        else:
            Path(workdir, fname).write_text(body, encoding="utf-8")


def _materialize_java_single(workdir: str, content: str) -> str:
    cleaned = _strip_java_package(content)
    class_name = _java_main_class_from_source(cleaned)
    Path(workdir, f"{class_name}.java").write_text(cleaned, encoding="utf-8")
    return class_name


def _materialize_java_multi(workdir: str, files: dict[str, str]) -> None:
    for fname, body in files.items():
        Path(workdir, fname).write_text(_strip_java_package(body), encoding="utf-8")


def _javac(workdir: str, timeout: int = 45) -> tuple[int, str, str]:
    java_sources = sorted(Path(workdir).glob("*.java"))
    if not java_sources:
        return 1, "", "No .java files to compile"
    names = [p.name for p in java_sources]
    proc = subprocess.run(
        ["javac", *names],
        cwd=workdir,
        capture_output=True,
        text=True,
        timeout=timeout,
    )
    return proc.returncode, proc.stdout or "", proc.stderr or ""


def _resolve_python_entry(files: dict[str, str], entry_hint: str | None) -> str | None:
    py_keys = [k for k in files if k.lower().endswith(".py")]
    if not py_keys:
        return None
    if entry_hint:
        try:
            sk = sanitize_upload_filename(entry_hint)
        except ValueError:
            return None
        if sk not in files:
            return None
        if not sk.lower().endswith(".py"):
            return None
        return sk
    if len(py_keys) == 1:
        return py_keys[0]
    for name in py_keys:
        if name.lower() == "main.py":
            return name
    return sorted(py_keys, key=str.lower)[0]


def _resolve_java_entry(
    files: dict[str, str], entry_hint: str | None
) -> str | None:
    java_keys = [k for k in files if k.lower().endswith(".java")]
    if not java_keys:
        return None
    if entry_hint:
        if not _JAVA_CLASS_RE.match(entry_hint.strip()):
            return None
        return entry_hint.strip()
    if len(java_keys) == 1:
        return _java_main_class_from_source(files[java_keys[0]])
    for name in java_keys:
        if name.lower() == "main.java":
            return _java_main_class_from_source(files[name])
    for name in java_keys:
        body = files.get(name) or ""
        if re.search(r"public\s+static\s+void\s+main\s*\(", body):
            return _java_main_class_from_source(body)
    first = sorted(java_keys, key=str.lower)[0]
    return _java_main_class_from_source(files[first])


def _run_one_python(
    workdir: str,
    script_basename: str,
    text_input: str,
    expected_output: str,
    is_file_input: bool,
    timeout: int,
) -> dict:
    start = time.monotonic()
    stdin_text = (text_input or "").rstrip("\n") + ("\n" if text_input else "")

    try:
        if is_file_input:
            Path(workdir, "input.txt").write_text(text_input or "", encoding="utf-8")
            proc = subprocess.run(
                [sys.executable, script_basename],
                cwd=workdir,
                capture_output=True,
                text=True,
                timeout=timeout,
            )
            stdout, stderr, code = proc.stdout or "", proc.stderr or "", proc.returncode
        else:
            proc = subprocess.run(
                [sys.executable, script_basename],
                cwd=workdir,
                input=stdin_text,
                capture_output=True,
                text=True,
                timeout=timeout,
            )
            stdout, stderr, code = proc.stdout or "", proc.stderr or "", proc.returncode
    except subprocess.TimeoutExpired:
        duration = time.monotonic() - start
        return {
            "stdout": "",
            "stderr": "Error: Execution timed out.",
            "duration": duration,
            "exit_code": 124,
            "is_success": False,
        }
    except Exception as e:
        duration = time.monotonic() - start
        return {
            "stdout": "",
            "stderr": f"System/Execution Error: {e}",
            "duration": duration,
            "exit_code": 1,
            "is_success": False,
        }

    duration = time.monotonic() - start
    expected_str = str(expected_output).strip()
    actual_str = str(stdout).strip()
    err = (stderr or "").strip()
    is_success = code == 0 and actual_str == expected_str
    return {
        "stdout": actual_str,
        "stderr": err or "",
        "duration": duration,
        "exit_code": code,
        "is_success": is_success,
    }


def _run_one_java(
    workdir: str,
    main_class: str,
    text_input: str,
    expected_output: str,
    is_file_input: bool,
    timeout: int,
) -> dict:
    start = time.monotonic()
    stdin_text = (text_input or "").rstrip("\n") + ("\n" if text_input else "")

    try:
        if is_file_input:
            Path(workdir, "input.txt").write_text(text_input or "", encoding="utf-8")
            proc = subprocess.run(
                ["java", "-cp", workdir, main_class],
                cwd=workdir,
                capture_output=True,
                text=True,
                timeout=timeout,
            )
        else:
            proc = subprocess.run(
                ["java", "-cp", workdir, main_class],
                cwd=workdir,
                input=stdin_text,
                capture_output=True,
                text=True,
                timeout=timeout,
            )
        stdout, stderr, code = proc.stdout or "", proc.stderr or "", proc.returncode
    except subprocess.TimeoutExpired:
        duration = time.monotonic() - start
        return {
            "stdout": "",
            "stderr": "Error: Execution timed out.",
            "duration": duration,
            "exit_code": 124,
            "is_success": False,
        }
    except Exception as e:
        duration = time.monotonic() - start
        return {
            "stdout": "",
            "stderr": f"System/Execution Error: {e}",
            "duration": duration,
            "exit_code": 1,
            "is_success": False,
        }

    duration = time.monotonic() - start
    expected_str = str(expected_output).strip()
    actual_str = str(stdout).strip()
    err = (stderr or "").strip()
    is_success = code == 0 and actual_str == expected_str
    return {
        "stdout": actual_str,
        "stderr": err or "",
        "duration": duration,
        "exit_code": code,
        "is_success": is_success,
    }


def run_untrusted_python(student_code, test_cases, is_file_input=False):
    try:
        payload = parse_submission_payload(student_code)
    except ValueError as e:
        return _all_tests_error(test_cases, str(e))

    if payload["mode"] == "single":
        with tempfile.TemporaryDirectory(prefix="cg_py_") as workdir:
            script = _materialize_python_single(workdir, payload["content"])
            out = []
            for tc in test_cases:
                r = _run_one_python(
                    workdir,
                    script,
                    tc.get("input", "") or "",
                    tc.get("expected_output", ""),
                    is_file_input,
                    PY_TIMEOUT,
                )
                r["test_case_id"] = tc.get("id")
                out.append(r)
            return out

    files = payload["files"]
    for name in files:
        if not name.lower().endswith(".py"):
            return _all_tests_error(test_cases, f"Invalid file in Python bundle: {name}")

    entry_py = _resolve_python_entry(files, payload.get("entry"))
    if not entry_py:
        return _all_tests_error(
            test_cases,
            "Could not resolve a Python entry file for this bundle.",
        )

    with tempfile.TemporaryDirectory(prefix="cg_py_") as workdir:
        _materialize_python_multi(workdir, files, entry_py)
        out = []
        for tc in test_cases:
            r = _run_one_python(
                workdir,
                entry_py,
                tc.get("input", "") or "",
                tc.get("expected_output", ""),
                is_file_input,
                PY_TIMEOUT,
            )
            r["test_case_id"] = tc.get("id")
            out.append(r)
        return out


def run_untrusted_java(student_code, test_cases, is_file_input=False):
    try:
        payload = parse_submission_payload(student_code)
    except ValueError as e:
        return _all_tests_error(test_cases, str(e))

    if payload["mode"] == "single":
        with tempfile.TemporaryDirectory(prefix="cg_java_") as workdir:
            main_class = _materialize_java_single(workdir, payload["content"])
            code, _, err = _javac(workdir)
            if code != 0:
                return [
                    {
                        "test_case_id": tc.get("id"),
                        "stdout": "",
                        "stderr": f"Compilation Error:\n{err}",
                        "duration": 0,
                        "exit_code": code,
                        "is_success": False,
                    }
                    for tc in test_cases
                ]
            results = []
            for tc in test_cases:
                r = _run_one_java(
                    workdir,
                    main_class,
                    tc.get("input", "") or "",
                    tc.get("expected_output", ""),
                    is_file_input,
                    JAVA_TIMEOUT,
                )
                r["test_case_id"] = tc.get("id")
                results.append(r)
            return results

    files = payload["files"]
    for name in files:
        if not name.lower().endswith(".java"):
            return _all_tests_error(test_cases, f"Invalid file in Java bundle: {name}")

    main_class = _resolve_java_entry(files, payload.get("entry"))
    if not main_class:
        return _all_tests_error(
            test_cases,
            "Could not resolve a Java main class for this bundle.",
        )

    with tempfile.TemporaryDirectory(prefix="cg_java_") as workdir:
        _materialize_java_multi(workdir, files)
        code, _, err = _javac(workdir)
        if code != 0:
            return [
                {
                    "test_case_id": tc.get("id"),
                    "stdout": "",
                    "stderr": f"Compilation Error:\n{err}",
                    "duration": 0,
                    "exit_code": code,
                    "is_success": False,
                }
                for tc in test_cases
            ]
        results = []
        for tc in test_cases:
            r = _run_one_java(
                workdir,
                main_class,
                tc.get("input", "") or "",
                tc.get("expected_output", ""),
                is_file_input,
                JAVA_TIMEOUT,
            )
            r["test_case_id"] = tc.get("id")
            results.append(r)
        return results


if __name__ == "__main__":
    code = """
a = int(input())
b = int(input())
print(a+b)
"""
    test_cases = [
        {"id": "1", "input": "1\n1", "expected_output": "2"},
        {"id": "2", "input": "1\n2", "expected_output": "3"},
    ]
    print(run_untrusted_python(code, test_cases, False))
