# Generated by Django 4.2.7 on 2024-01-22 07:34

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('core_fileupload', '0015_alter_file_tags'),
        ('core_analysis', '0020_initial'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='analysisdata',
            unique_together=set(),
        ),
        migrations.AddField(
            model_name='analysisdata',
            name='data',
            field=models.JSONField(default=dict),
        ),
        migrations.AddField(
            model_name='analysisdata',
            name='family',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='core_fileupload.family'),
        ),
        migrations.RemoveField(
            model_name='analysisdata',
            name='key',
        ),
        migrations.RemoveField(
            model_name='analysisdata',
            name='value',
        ),
    ]