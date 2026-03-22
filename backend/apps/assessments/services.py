from e2b import TimeoutException
from e2b_code_interpreter import Sandbox
from pathlib import Path
from dotenv import load_dotenv
import os
import time
import re


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
