from rest_framework import serializers
from apps.assessments.models import Submission, RubricResult, TestResult
from apps.assignments.serializers import TestCaseSerializer, RubricCriteriaSerializer
from apps.core.serializers import BaseSerializers
from django.core.validators import FileExtensionValidator
from django.db.models import Sum
from django.utils import timezone

class RubricResultSerializer(serializers.ModelSerializer):
    # Expose rubric criterion details (name, description, max_points) for read-only use
    rubric_criteria_detail = RubricCriteriaSerializer(
        read_only=True, source="rubric_criteria"
    )

    class Meta:
        model = RubricResult
        fields = [
            "id",
            "submission",
            "rubric_criteria",
            "rubric_criteria_detail",
            "points_awarded",
            "optional_feedback",
        ]
    
    def validate(self, attrs):
        submission = attrs.get('submission', getattr(self.instance, 'submission', None))
        rubric_criteria = attrs.get('rubric_criteria', getattr(self.instance, 'rubric_criteria', None))
        points_awarded = attrs.get('points_awarded', getattr(self.instance, 'points_awarded', 0))
        
        if not submission or not rubric_criteria:
            return attrs

        # 1. The Match-Up Rule
        if rubric_criteria.assignment != submission.assignment:
            raise serializers.ValidationError({"rubric_criteria": "This rubric criteria does not belong to the submitted assignment."})

        # 2. The Score Limit Rule
        if points_awarded < 0 or points_awarded > rubric_criteria.max_points:
            raise serializers.ValidationError({"points_awarded": f"Points awarded must be between 0 and {rubric_criteria.max_points}."})

        # 3. The "No Double Grading" Rule
        if not self.instance and RubricResult.objects.filter(submission=submission, rubric_criteria=rubric_criteria).exists():
            raise serializers.ValidationError({"rubric_criteria": "This submission has already been graded for this specific rubric criteria."})

        # 4. The Final Grade Ceiling
        existing_rubric_points = RubricResult.objects.filter(submission=submission).exclude(id=getattr(self.instance, 'id', None)).aggregate(total=Sum('points_awarded'))['total'] or 0
        
        existing_test_points = TestResult.objects.filter(
            submission=submission, 
            is_success=True 
        ).aggregate(total=Sum('test_case__weight'))['total'] or 0
        
        total_projected_points = existing_rubric_points + float(existing_test_points) + float(points_awarded)
        max_allowed = submission.assignment.max_points_allowed

        if total_projected_points > max_allowed:
            raise serializers.ValidationError({
                "points_awarded": f"Adding these points exceeds the assignment's max_points_allowed of {max_allowed}."
            })

        return attrs
   
        


class TestResultSerializer(serializers.ModelSerializer):
    test_case = TestCaseSerializer(read_only=True)

    class Meta:
        model = TestResult
        fields = "__all__"
        
    def validate(self, attrs):
        submission = attrs.get('submission', getattr(self.instance, 'submission', None))
        test_case = attrs.get('test_case', getattr(self.instance, 'test_case', None))
        #  We use is_success because points_earned doesn't exist in the model
        is_success = attrs.get('is_success', getattr(self.instance, 'is_success', False))

        if not submission or not test_case:
            return attrs

        # 1. The Match-Up Rule
        if test_case.assignment != submission.assignment:
            raise serializers.ValidationError({"test_case": "This test case does not belong to the submitted assignment."})

        # 2. The "No Double Jeopardy" Rule (Prevents duplicate test results)
        if not self.instance and TestResult.objects.filter(submission=submission, test_case=test_case).exists():
            raise serializers.ValidationError({"test_case": "A test result for this test case already exists on this submission."})

        # 3. The Final Grade Ceiling
        #  We only check the math if this test passed (is_success=True)
        if is_success:
            existing_rubric_points = RubricResult.objects.filter(
                submission=submission
            ).aggregate(total=Sum('points_awarded'))['total'] or 0
            
            # We sum the 'weight' from the parent TestCase instead of the missing points_earned field
            existing_test_points = TestResult.objects.filter(
                submission=submission, 
                is_success=True
            ).exclude(id=getattr(self.instance, 'id', None)).aggregate(total=Sum('test_case__weight'))['total'] or 0
            
            total_projected_points = float(existing_rubric_points) + float(existing_test_points) + float(test_case.weight)
            max_allowed = submission.assignment.max_points_allowed

            if total_projected_points > max_allowed:
                raise serializers.ValidationError({
                    "test_case": f"Passing this test exceeds the assignment's max_points_allowed of {max_allowed}."
                })

        return attrs
        


class SubmissionSerializer(BaseSerializers):
    test_results = TestResultSerializer(many=True, read_only=True)
    rubric_results = RubricResultSerializer(many=True, read_only=True)
    
    # File size limit validation
    submitted_file = serializers.FileField(
        validators=[FileExtensionValidator(allowed_extensions=['py', 'java', 'zip', 'txt'])]
    )

    class Meta(BaseSerializers.Meta):
        model = Submission
        fields = BaseSerializers.Meta.fields + [
           "id",
            "test_results",
            "rubric_results",
            "roster",
            "assignment",
            "group",
            "submitted_file",
            "status"
        ]
    
    def validate_submitted_file(self, value):
        """Limit file size to 5MB"""
        if value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError("File size must not exceed 5MB.")
        return value
        
    def validate(self, attrs):
       
        assignment = attrs.get('assignment', getattr(self.instance, 'assignment', None))
        roster = attrs.get('roster', getattr(self.instance, 'roster', None))
        group = attrs.get('group', getattr(self.instance, 'group', None))

        if not assignment or not roster:
            return attrs
        
        # 1. The Right Classroom Rule
        if roster.course != assignment.course:
            raise serializers.ValidationError({"roster": "Student must be enrolled in the course for this assignment."})

        # 2. The Group Project Rule
        if assignment.is_grouped and not group:
            raise serializers.ValidationError({"group": "This is a group assignment. A group must be provided."})
        if not assignment.is_grouped and group:
            raise serializers.ValidationError({"group": "This is an individual assignment. Leave the group field empty."})

        # 3. The Team Player Rule
        if group and not group.memberships.filter(roster=roster).exists():
            raise serializers.ValidationError({"roster": "The submitting student is not a member of the selected group."})

        # 4. The Deadline Rule (Only check if creating a NEW submission)
        if not self.instance and timezone.now() > assignment.deadline:
            raise serializers.ValidationError({"assignment": "The deadline for this assignment has passed."})

        return attrs
        
