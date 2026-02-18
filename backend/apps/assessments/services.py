import json
import logging
import requests


def submit_code_to_piston():
    """
    Utility to invoke the Lambda code runner with student code and test cases.
    """
    url = "http://localhost:2000/api/v2/execute"
    payload = {
        "language": "python",
        "version": "3.10.0",
        "files": [
            {"name": "main.py", "content": "print('Hello from Piston!')\nprint(1 + 1)"}
        ],
        "stdin": "",
        "args": [],
        "compile_timeout": 10000,
        "run_timeout": 3000,
        "compile_memory_limit": -1,
        "run_memory_limit": -1,
    }

    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()  # Raise error for bad status codes (4xx, 5xx)

        data = response.json()

        # Capture the standard output
        output = data.get("run", {}).get("stdout")
        exit_code = data.get("run", {}).get("code")

        print(f"--- Piston Output (Exit Code: {exit_code}) ---")
        print(output)

    except requests.exceptions.RequestException as e:
        print(f"Error connecting to Piston: {e}")


if __name__ == "__main__":
    submit_code_to_piston()
