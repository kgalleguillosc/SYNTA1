# Generated by Django 5.1.1 on 2024-10-19 19:35

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('trabajadores', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='perfil',
            name='RUT',
            field=models.CharField(default=0, max_length=20, unique=True),
            preserve_default=False,
        ),
    ]