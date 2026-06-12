from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('providers', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='provider',
            name='logo',
            field=models.ImageField(blank=True, null=True, upload_to='providers/'),
        ),
    ]
