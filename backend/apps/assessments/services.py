from e2b import TimeoutException
from e2b_code_interpreter import Sandbox
from pathlib import Path
from dotenv import load_dotenv
import os
import time

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
            input_data = test_case.get("input", "")

            if is_file_input:
                sandbox.files.write("/tmp/input.txt", input_data)

            time_limit = test_case.get("time_limit", 10)

            print(f"\n--------TEST-{index + 1} (Limit: {time_limit}s)---------")

            start_time = time.time()

            try:
                if not is_file_input:
                    sandbox.files.write("/tmp/in.txt", input_data + "\n")
                    execution = sandbox.commands.run(
                        "python3 /tmp/student.py < /tmp/in.txt", timeout=time_limit
                    )
                else:
                    execution = sandbox.commands.run(
                        "python3 /tmp/student.py",
                        timeout=time_limit,
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

    return results


def run_untrusted_java(student_code, test_cases, is_file_input):
    results = []

    # Note: Ensure your E2B sandbox env has Java installed (the 'base' env usually does)
    with Sandbox.create() as sandbox:
        for index, test_case in enumerate(test_cases):
            # 1. Write the Java code to a file named Main.java
            # We assume the user provided a class named 'Main'
            sandbox.files.write("/tmp/Main.java", student_code)

            input_data = test_case.get("input", "")
            time_limit = test_case.get("time_limit", 10)

            print(f"\n--------TEST-{index + 1} (Limit: {time_limit}s)---------")
            start_time = time.time()

            try:
                # 2. COMPILATION STEP
                compile_exec = sandbox.commands.run("javac /tmp/Main.java", timeout=10)

                if compile_exec.exit_code != 0:
                    # Compilation Failed
                    duration = time.time() - start_time
                    stdout = ""
                    stderr = f"Compile Error:\n{compile_exec.stderr}"
                    exit_code = compile_exec.exit_code
                    is_success = False
                else:
                    # 3. EXECUTION STEP (If compilation succeeded)
                    if is_file_input:
                        sandbox.files.write("/tmp/input.txt", input_data)
                        execution = sandbox.commands.run(
                            "java -cp /tmp Main", timeout=time_limit
                        )
                    else:
                        # Standard Input Redirection
                        sandbox.files.write("/tmp/in.txt", input_data + "\n")
                        execution = sandbox.commands.run(
                            "java -cp /tmp Main < /tmp/in.txt", timeout=time_limit
                        )

                    duration = time.time() - start_time
                    stdout = execution.stdout
                    stderr = execution.stderr
                    exit_code = execution.exit_code

                    # Logic Validation
                    expected_str = str(test_case.get("expected_output", "")).strip()
                    actual_str = str(stdout).strip()
                    is_success = exit_code == 0 and expected_str == actual_str

            except TimeoutException:
                duration = time.time() - start_time
                stdout = ""
                stderr = "Error: Execution timed out."
                exit_code = 124
                is_success = False

            except Exception as e:
                duration = time.time() - start_time
                stdout = ""
                stderr = f"System/Execution Error: {str(e)}"
                exit_code = 1
                is_success = False

            print(f"Duration: {duration:.4f}s")
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
