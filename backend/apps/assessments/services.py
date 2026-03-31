from e2b import TimeoutException
from e2b_code_interpreter import Sandbox
from pathlib import Path
from dotenv import load_dotenv
from django.db.models import F, Q
import os
import time
import re
import difflib
import logging

logger = logging.getLogger(__name__)


def run_untrusted_python(student_code, test_cases, is_file_input):
    results = []

    with Sandbox.create() as sandbox:
        for index, test_case in enumerate(test_cases):
            student_code_to_write = f"""import builtins

# Save the real input function
_original_input = builtins.input

# Redefine it to ignore the prompt argument and call the original with nothing
def silent_input(prompt=""):
    return _original_input()

builtins.input = silent_input
{student_code}
"""
            sandbox.files.write("/tmp/student.py", student_code_to_write)
            print(f"STUDENT CODE TO WRITE: {student_code_to_write}")
            input_data = (
                test_case.get("input", "").strip() + "\n"
                if test_case.get("input", "")
                else ""
            )
            print(f"INPUT DATA: {input_data}")

            if is_file_input:
                sandbox.files.write("/tmp/input.txt", input_data)

            time_limit = test_case.get("time_limit", 10)

            print(f"\n--------TEST-{index + 1} (Limit: {time_limit}s)---------")

            start_time = time.time()

            try:
                if not is_file_input:
                    cmd = sandbox.commands.run(
                        "python3 /tmp/student.py", background=True, stdin=True
                    )
                    sandbox.commands.send_stdin(cmd.pid, input_data)
                    execution = cmd.wait()
                    print(f"EXECUTION: {str(execution)}")
                else:
                    execution = sandbox.commands.run(
                        "python3 /tmp/student.py",
                        timeout=time_limit,
                        cwd="/tmp",
                    )
                end_time = time.time()

                duration = end_time - start_time
                stdout = execution.stdout
                stderr = execution.stderr
                exit_code = execution.exit_code

                # Check for success vs Logic Error
                expected_str = str(test_case.get("expected_output", "")).strip()
                actual_str = str(stdout).strip()
                is_success = exit_code == 0 and expected_str == actual_str

            except TimeoutException:
                # Specifically handles the E2B Timeout
                end_time = time.time()
                duration = end_time - start_time
                stdout = ""
                stderr = "Error: Execution timed out."
                exit_code = 124
                is_success = False

            except Exception as e:
                # Catches connection issues, sandbox crashes, or other unexpected errors
                end_time = time.time()
                duration = end_time - start_time
                stdout = ""
                stderr = f"System/Execution Error: {str(e)}"
                exit_code = 1
                is_success = False

            print(f"Duration: {duration:.4f}s")
            print(f"Stdout: {stdout}")
            print(f"Is Success: {is_success}")

            results.append(
                {
                    "test_case_id": test_case.get("id"),
                    "stdout": stdout.strip(),
                    "stderr": stderr.strip(),
                    "duration": duration,
                    "exit_code": exit_code,
                    "is_success": is_success,
                }
            )
            print(f"RESULTSSSSSS: {results}")
            print(f"EXIT CODE: {exit_code}")
            print(f"IS SUCCESS: {is_success}")
            print(f"STDERR: {stderr}")
            print(f"STDOUT: {stdout}")
    return results


def run_untrusted_java(student_code, test_cases, is_file_input):
    results = []
    cleaned_code = re.sub(
        r"^\s*package\s+[\w\.]+;\s*", "", student_code, flags=re.MULTILINE
    )
    class_match = re.search(r"public\s+class\s+(\w+)", cleaned_code)
    if not class_match:
        class_match = re.search(r"class\s+(\w+)", cleaned_code)

    class_name = class_match.group(1) if class_match else "Main"
    file_path = f"/tmp/{class_name}.java"

    # Note: Ensure your E2B sandbox env has Java installed (the 'base' env usually does)
    with Sandbox.create() as sandbox:
        sandbox.files.write(file_path, cleaned_code)
        compile_exec = sandbox.commands.run(f"javac {file_path}", timeout=15)
        if compile_exec.exit_code != 0:
            # If compilation fails, return the error for all test cases
            return [
                {
                    "test_case_id": tc.get("id"),
                    "stdout": "",
                    "stderr": f"Compilation Error:\n{compile_exec.stderr}",
                    "duration": 0,
                    "exit_code": compile_exec.exit_code,
                    "is_success": False,
                }
                for tc in test_cases
            ]
        for index, test_case in enumerate(test_cases):
            # 1. Write the Java code to a file named Main.java
            # We assume the user provided a class named 'Main'

            input_data = test_case.get("input", "")
            time_limit = test_case.get("time_limit", 10)
            expected_output = str(test_case.get("expected_output", "")).strip()

            print(f"\n--------TEST-{index + 1} (Limit: {time_limit}s)---------")
            start_time = time.time()

            try:
                if is_file_input:
                    sandbox.files.write("/tmp/input.txt", input_data)
                    # Use the detected class_name
                    execution = sandbox.commands.run(
                        f"java -cp /tmp {class_name}", timeout=time_limit, cwd="/tmp"
                    )
                else:
                    # Standard Input Redirection
                    sandbox.files.write("/tmp/in.txt", input_data + "\n")
                    execution = sandbox.commands.run(
                        "java -cp /tmp Main < /tmp/in.txt", timeout=15
                    )

                duration = time.time() - start_time
                actual_output = execution.stdout.strip()

                # Validation
                is_success = (
                    execution.exit_code == 0 and actual_output == expected_output
                )

                results.append(
                    {
                        "test_case_id": test_case.get("id"),
                        "stdout": execution.stdout,
                        "stderr": execution.stderr,
                        "duration": duration,
                        "exit_code": execution.exit_code,
                        "is_success": is_success,
                    }
                )

            except Exception as e:
                # This catches both E2B Timeout and general errors
                error_msg = (
                    "Error: Execution timed out."
                    if "timeout" in str(e).lower()
                    else f"System Error: {str(e)}"
                )
                results.append(
                    {
                        "test_case_id": test_case.get("id"),
                        "stdout": "",
                        "stderr": error_msg,
                        "duration": time.time() - start_time,
                        "exit_code": 124 if "timeout" in str(e).lower() else 1,
                        "is_success": False,
                    }
                )

    return results


# def save_test_results_helper(submission, results):
#     """_summary_

#     Args:
#         submission (_type_): Submission
#         results (_type_): {
#                     "test_case_id": test_case.id,
#                     "stdout": stdout.strip(),
#                     "stderr": stderr.strip(),
#                     "duration": duration,
#                     "exit_code": exit_code,
#                     "test_result": is_success,
#                 }

#     Returns:
#         _type_: None
#     """
#     for index, result in enumerate(results):

#     submission.update_test_status(status=Submission.Status.COMPLETE)


def _extract_python_classes(code: str) -> dict:
    """
    Uses Python's ast module to extract classes and their non-dunder methods.
    Returns {class_name: {method_name: unparsed_source}}.
    """
    import ast as _ast
    try:
        tree = _ast.parse(code)
    except SyntaxError:
        return {}

    classes = {}
    for node in _ast.walk(tree):
        if isinstance(node, _ast.ClassDef):
            methods = {}
            for item in node.body:
                if isinstance(item, (_ast.FunctionDef, _ast.AsyncFunctionDef)):
                    if item.name.startswith("__"):
                        continue
                    try:
                        methods[item.name] = _ast.unparse(item)
                    except Exception:
                        pass
            if methods:
                classes[node.name] = methods
    return classes


def _extract_java_classes(code: str) -> dict:
    """
    Uses regex + brace-matching to extract classes and their methods from Java code.
    Returns {class_name: {method_name: method_body}}.
    """
    classes = {}
    class_pat = re.compile(
        r'(?:public\s+|private\s+|protected\s+)?(?:abstract\s+|final\s+)?class\s+(\w+)[^{]*\{',
        re.MULTILINE,
    )
    method_pat = re.compile(
        r'(?:(?:public|private|protected|static|final|synchronized|abstract|void|int|long|double|float|boolean|String|char|byte|short)\s+)+'
        r'(\w+)\s*\([^)]*\)\s*(?:throws\s+[\w,\s]+)?\{',
        re.MULTILINE,
    )
    skip = {"if", "while", "for", "switch", "catch", "try"}

    def extract_block(src, start):
        depth, pos = 1, start
        while pos < len(src) and depth:
            if src[pos] == "{":
                depth += 1
            elif src[pos] == "}":
                depth -= 1
            pos += 1
        return src[start : pos - 1]

    for cm in class_pat.finditer(code):
        class_name = cm.group(1)
        class_body = extract_block(code, cm.end())
        methods = {}
        for mm in method_pat.finditer(class_body):
            method_name = mm.group(1)
            if method_name in skip:
                continue
            methods[method_name] = extract_block(class_body, mm.end())
        if methods:
            classes[class_name] = methods
    return classes


def detect_cross_class_issues(code: str, language: str) -> dict:
    """
    Detects duplicate method functionality across classes in a single submission
    using token-based trigram Jaccard similarity. No external API required.
    Returns {has_issues, issues[{class_a, class_b, duplicate_methods[{method_a,
    method_b, similarity, snippet_a, snippet_b}]}]}.
    """
    lang = language.lower()
    if lang == "python":
        classes = _extract_python_classes(code)
        if len(classes) < 2:
            classes = _extract_java_classes(code)
    elif lang == "java":
        classes = _extract_java_classes(code)
        if len(classes) < 2:
            classes = _extract_python_classes(code)
    else:
        return {"has_issues": False, "issues": []}

    class_names = list(classes.keys())
    if len(class_names) < 2:
        return {"has_issues": False, "issues": []}

    THRESHOLD = 0.5
    issues = []

    for i in range(len(class_names)):
        for j in range(i + 1, len(class_names)):
            name_a, name_b = class_names[i], class_names[j]
            methods_a = classes[name_a]
            methods_b = classes[name_b]

            duplicates = []
            for m_a, body_a in methods_a.items():
                tokens_a = _tokenize_code(body_a, language)
                for m_b, body_b in methods_b.items():
                    tokens_b = _tokenize_code(body_b, language)
                    score = _ngram_jaccard(tokens_a, tokens_b)
                    if score >= THRESHOLD:
                        duplicates.append({
                            "method_a": m_a,
                            "method_b": m_b,
                            "similarity": round(score, 3),
                            "snippet_a": body_a.strip()[:600],
                            "snippet_b": body_b.strip()[:600],
                        })

            if duplicates:
                issues.append({
                    "class_a": name_a,
                    "class_b": name_b,
                    "duplicate_methods": duplicates,
                })

    return {"has_issues": len(issues) > 0, "issues": issues}


def _tokenize_code(code: str, language: str) -> list:
    """
    Converts code into a list of meaningful tokens, stripping comments,
    whitespace, and language boilerplate so that common syntax does not
    inflate the similarity score.
    """
    if language == "python":
        import tokenize as _tokenize
        import io as _io

        try:
            tokens = []
            for tok in _tokenize.generate_tokens(_io.StringIO(code).readline):
                if tok.type in (
                    _tokenize.COMMENT,
                    _tokenize.NEWLINE,
                    _tokenize.NL,
                    _tokenize.ENCODING,
                    _tokenize.ENDMARKER,
                    _tokenize.INDENT,
                    _tokenize.DEDENT,
                    _tokenize.STRING,  # skip string literals / docstrings
                ):
                    continue
                token_val = tok.string.strip()
                if token_val:
                    tokens.append(token_val.lower())
            return tokens
        except Exception:
            pass  # fall through to regex fallback

    # Java / fallback: strip comments, extract word tokens
    code = re.sub(r"//.*?$", "", code, flags=re.MULTILINE)
    code = re.sub(r"/\*.*?\*/", "", code, flags=re.DOTALL)
    code = re.sub(r"#.*?$", "", code, flags=re.MULTILINE)
    return [t.lower() for t in re.findall(r"\b\w+\b", code) if len(t) > 1]


def _ngram_jaccard(tokens_a: list, tokens_b: list, n: int = 3) -> float:
    """
    Computes Jaccard similarity on token n-grams.
    Using trigrams (n=3) means short common keywords only match when they
    appear in the same sequence, dramatically reducing false positives from
    shared boilerplate.
    """
    if len(tokens_a) < n or len(tokens_b) < n:
        # Fall back to unigram Jaccard for very short submissions
        set_a, set_b = set(tokens_a), set(tokens_b)
        union = len(set_a | set_b)
        return len(set_a & set_b) / union if union else 0.0

    grams_a = set(tuple(tokens_a[i : i + n]) for i in range(len(tokens_a) - n + 1))
    grams_b = set(tuple(tokens_b[i : i + n]) for i in range(len(tokens_b) - n + 1))
    union = len(grams_a | grams_b)
    return len(grams_a & grams_b) / union if union else 0.0


def check_plagiarism(submission) -> list:
    """
    Compares the submission against other students' submissions for the same assignment
    using token-based trigram Jaccard similarity. This avoids false positives
    from shared language syntax/boilerplate.
    Excludes the same student's other attempts (same roster); only compares across rosters.
    Saves PlagiarismMatch records for pairs with similarity >= 0.4.
    """
    from apps.assessments.models import PlagiarismMatch, Submission as Sub

    code_a = (submission.submitted_file or "").strip()
    if not code_a:
        return []

    language = getattr(submission.assignment, "language", "python")
    tokens_a = _tokenize_code(code_a, language)
    if not tokens_a:
        return []

    # Remove legacy rows where this submission was matched against another attempt by the same student
    PlagiarismMatch.objects.filter(
        Q(submission_a=submission) | Q(submission_b=submission)
    ).filter(submission_a__roster_id=F("submission_b__roster_id")).delete()

    other_submissions = (
        Sub.objects.filter(assignment=submission.assignment)
        .exclude(pk=submission.pk)
        .exclude(roster_id=submission.roster_id)
        .exclude(submitted_file__isnull=True)
        .exclude(submitted_file="")
    )

    matches = []
    for other in other_submissions:
        code_b = other.submitted_file.strip()
        tokens_b = _tokenize_code(code_b, language)
        if not tokens_b:
            continue

        score = _ngram_jaccard(tokens_a, tokens_b)

        # Delete any existing match below threshold (from previous runs)
        if score < 0.4:
            a, b = sorted([submission, other], key=lambda s: str(s.pk))
            PlagiarismMatch.objects.filter(submission_a=a, submission_b=b).delete()
            continue

        a, b = sorted([submission, other], key=lambda s: str(s.pk))
        PlagiarismMatch.objects.update_or_create(
            submission_a=a,
            submission_b=b,
            defaults={"similarity_score": round(score, 4)},
        )
        matches.append({"submission_id": str(other.id), "similarity": round(score, 4)})

    return matches


if __name__ == "__main__":
    BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
    load_dotenv(os.path.join(BASE_DIR, ".env"))
    SECRET_KEY = os.getenv("E2B_API_KEY")
    code = """
a = int(input())
b = int(input())
print(a+b)
"""
    test_cases = [
        {"input": "1\n1", "expected_output": "2"},
        {"input": "1\n2", "expected_output": "3"},
    ]
    result = run_untrusted_python(code, test_cases)
    print(result)
