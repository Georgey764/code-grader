from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("assessments", "0021_ai_detection_plagiarism_model"),
    ]

    operations = [
        migrations.AddField(
            model_name="submission",
            name="cross_class_issues",
            field=models.JSONField(blank=True, null=True),
        ),
    ]
