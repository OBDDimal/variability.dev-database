# Generated by Django 4.2.7 on 2024-01-21 17:40

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core_fileupload', '0014_file_private'),
    ]

    operations = [
        migrations.AlterField(
            model_name='file',
            name='tags',
            field=models.ManyToManyField(blank=True, to='core_fileupload.tag'),
        ),
    ]