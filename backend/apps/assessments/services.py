from e2b_code_interpreter import Sandbox
from pathlib import Path
from dotenv import load_dotenv
import os
import time


def run_untrusted_python(student_code, test_cases, is_file_input):
    results = []

    with Sandbox.create() as sandbox:
        for index, test_case in enumerate(test_cases):
            # 1. Handle Input Method
            input_data = test_case.get("input", "")

            if is_file_input:
                # Write to input.txt; student code should use open('input.txt')
                sandbox.files.write("input.txt", input_data)
                cmd = f'python3 -c "{student_code}"'
            else:
                # Pipe to stdin; student code should use input()
                cmd = f"echo -e '{input_data}' | python3 -c \"{student_code}\""

            # 2. Get Time Limit (default to 5s if not provided)
            # E2B timeout is in seconds
            time_limit = test_case.get("time_limit", 5)

            print(f"\n--------TEST-{index + 1} (Limit: {time_limit}s)---------")

            start_time = time.time()
            try:
                # 3. Execute with Timeout
                execution = sandbox.commands.run(cmd, timeout=time_limit)
                end_time = time.time()

                duration = end_time - start_time
                stdout = execution.stdout
                stderr = execution.stderr
                exit_code = execution.exit_code

                # Check for success
                expected_str = str(test_case.get("expected_output", "")).strip()
                actual_str = str(stdout).strip()
                is_success = expected_str == actual_str and exit_code == 0

            except Exception as e:
                # This catches E2B Timeout errors or connection issues
                end_time = time.time()
                duration = end_time - start_time
                stdout = ""
                stderr = f"Execution Error or Timeout: {str(e)}"
                exit_code = 124  # Standard exit code for timeout
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
    file_name = "Main.java"
    class_name = "Main"

    with Sandbox.create() as sandbox:
        # 1. Write and Compile (Done once for all test cases)
        sandbox.files.write(file_name, student_code)
        compilation = sandbox.commands.run(f"javac {file_name}")

        if compilation.exit_code != 0:
            # Return compilation error format consistent with your results
            return [
                {
                    "test_case_id": None,
                    "stdout": "",
                    "stderr": f"Compilation Error:\n{compilation.stderr}",
                    "duration": 0,
                    "exit_code": compilation.exit_code,
                    "is_success": False,
                }
            ]

        # 2. Run Test Cases
        for index, test_case in enumerate(test_cases):
            input_data = test_case.get("input", "")
            time_limit = test_case.get("time_limit", 5)  # Default 5s

            if is_file_input:
                # Write to input.txt; Java code should use new File("input.txt")
                sandbox.files.write("input.txt", input_data)
                cmd = f"java {class_name}"
            else:
                # Pipe to stdin; Java code should use new Scanner(System.in)
                cmd = f"echo -e '{input_data}' | java {class_name}"

            print(f"\n--------JAVA TEST-{index + 1} (Limit: {time_limit}s)---------")

            start_time = time.time()
            try:
                # 3. Execute with Timeout
                execution = sandbox.commands.run(cmd, timeout=time_limit)
                duration = time.time() - start_time

                stdout = execution.stdout.strip()
                stderr = execution.stderr.strip()
                exit_code = execution.exit_code

                expected_str = str(test_case.get("expected_output", "")).strip()
                # Success requires matching output AND a clean exit code
                is_success = stdout == expected_str and exit_code == 0

            except Exception as e:
                # Handle Timeouts or Sandbox crashes
                duration = time.time() - start_time
                stdout = ""
                stderr = f"Runtime Error or Timeout: {str(e)}"
                exit_code = 124
                is_success = False

            results.append(
                {
                    "test_case_id": test_case.get("id"),
                    "stdout": stdout,
                    "stderr": stderr,
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
