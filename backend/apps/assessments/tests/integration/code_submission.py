import pytest
from apps.assessments.models import Submission, TestCase
from apps.assessments.services import run_untrusted_python


@pytest.mark.django_db
class TestCodeSubmission:
    def test_code_post(self, submission):
        instance = Submission.objects.get(id=submission.id)

        test_cases = [
            {"id": tc.id, "input": tc.input_text, "expected_output": tc.expected_output}
            for tc in TestCase.objects.filter(assignment=instance.assignment)
        ]
        print(f"DEBUG: Found {len(test_cases)} test cases.")

        # 2. Check File Reading
        with instance.submitted_file.open("r") as f:
            student_code = f.read()
        print(f"DEBUG: Code snippet: {student_code}")

        # 3. Test the runner
        try:
            results = run_untrusted_python(student_code, test_cases)
            print(f"DEBUG: Results received: {results}")
            if results:
                assert 1 == 1
            else:
                assert 1 == 0
        except Exception as e:
            print(f"DEBUG: Logic failed with error: {e}")
            assert 1 == 0
