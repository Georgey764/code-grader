import uuid
import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("assessments", "0020_rename_submission_table"),
    ]

    operations = [
        # PlagiarismMatch table already exists in the database from a prior branch.
        # Use SeparateDatabaseAndState so Django's ORM knows about the model
        # without trying to CREATE the table again.
        migrations.CreateModel(
            name="PlagiarismMatch",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("similarity_score", models.FloatField()),
                (
                    "submission_a",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="plagiarism_matches_as_a",
                        to="assessments.submission",
                    ),
                ),
                (
                    "submission_b",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="plagiarism_matches_as_b",
                        to="assessments.submission",
                    ),
                ),
            ],
            options={
                "db_table": "plagiarism_match",
                "ordering": ["-similarity_score"],
                "constraints": [
                    models.UniqueConstraint(
                        fields=["submission_a", "submission_b"],
                        name="unique_plagiarism_submission_pair",
                    )
                ],
            },
        ),
        # Add AI detection fields to Submission — these are new columns.
        migrations.AddField(
            model_name="submission",
            name="ai_written_probability",
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="submission",
            name="ai_detection_details",
            field=models.JSONField(blank=True, null=True),
        ),
    ]
