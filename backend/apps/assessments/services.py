from e2b_code_interpreter import Sandbox
from pathlib import Path
from dotenv import load_dotenv
import os
import time


def run_untrusted_python(student_code, test_cases):

    results = []
    with Sandbox.create() as sandbox:
        for index, test_case in enumerate(test_cases):
            cmd = f"echo -e '{test_case['input']}' | python3 -c \"{student_code}\""
            start_time = time.time()
            execution = sandbox.commands.run(cmd)
            end_time = time.time()

            print(f"\n--------TEST-{index + 1}---------\n")

            duration = end_time - start_time
            print(f"Duration: {duration}")

            stdout = execution.stdout
            print(f"Stdout: {stdout}")

            stderr = execution.stderr
            print(f"Stderr: {stderr}")

            exit_code = execution.exit_code
            print(f"Exit Code: {exit_code}")

            expected_str = str(test_case.get("expected_output", None)).strip()
            actual_str = str(stdout).strip()

            print(f"Expected Output: {expected_str}")
            print(f"Actual Output: {actual_str}")

            if expected_str == actual_str:
                print(f"\nTest Status: {index + 1}")
                is_success = True
            else:
                print(f"\nTest Status: {index + 1}")
                is_success = False

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
