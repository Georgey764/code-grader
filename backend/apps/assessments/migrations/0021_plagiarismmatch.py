import uuid

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("assessments", "0020_alter_submission_options_submission_ai_prediction_and_more"),
    ]

    operations = [
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
                ("similarity_score", models.FloatField(help_text="Structural similarity ratio in the range [0.0, 1.0].")),
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
                "verbose_name": "Plagiarism Match",
                "verbose_name_plural": "Plagiarism Matches",
                "db_table": "plagiarism_match",
                "ordering": ["-similarity_score", "-created_at"],
            },
        ),
        migrations.AddConstraint(
            model_name="plagiarismmatch",
            constraint=models.UniqueConstraint(
                fields=("submission_a", "submission_b"),
                name="unique_plagiarism_submission_pair",
            ),
        ),
    ]
