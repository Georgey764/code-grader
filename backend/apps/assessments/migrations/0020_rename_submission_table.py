from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('assessments', '0019_alter_rubricresult_points_and_more'),
    ]

    operations = [
        migrations.AlterModelTable(
            name='submission',
            table='submission',
        ),
    ]
