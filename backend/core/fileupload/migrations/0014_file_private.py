# Generated by Django 4.2.2 on 2023-10-26 07:29

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core_fileupload', '0013_file_private_alter_file_family_alter_file_version'),
    ]

    operations = [
        migrations.AddField(
            model_name='file',
            name='private',
            field=models.BooleanField(default=False),
        ),
    ]