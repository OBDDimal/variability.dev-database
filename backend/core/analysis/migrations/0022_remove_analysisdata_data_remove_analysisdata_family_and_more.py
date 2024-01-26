# Generated by Django 4.2.7 on 2024-01-22 09:52

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core_analysis', '0021_alter_analysisdata_unique_together_analysisdata_data_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='analysisdata',
            name='data',
        ),
        migrations.RemoveField(
            model_name='analysisdata',
            name='family',
        ),
        migrations.AddField(
            model_name='analysisdata',
            name='key',
            field=models.CharField(db_index=True, default='', max_length=255),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='analysisdata',
            name='value',
            field=models.JSONField(default=dict),
        ),
        migrations.AddIndex(
            model_name='analysisdata',
            index=models.Index(fields=['key'], name='core_analys_key_405338_idx'),
        ),
    ]