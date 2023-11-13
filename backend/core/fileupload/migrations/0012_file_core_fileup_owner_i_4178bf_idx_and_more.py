# Generated by Django 4.2.2 on 2023-10-12 10:44

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core_fileupload', '0011_analysisresult'),
    ]

    operations = [
        migrations.AddIndex(
            model_name='file',
            index=models.Index(fields=['owner', 'confirmation_token'], name='core_fileup_owner_i_4178bf_idx'),
        ),
        migrations.AddIndex(
            model_name='file',
            index=models.Index(fields=['confirmation_token'], name='core_fileup_confirm_22c787_idx'),
        ),
        migrations.AddIndex(
            model_name='file',
            index=models.Index(fields=['family', 'version', 'is_confirmed'], name='core_fileup_family__df0347_idx'),
        ),
    ]