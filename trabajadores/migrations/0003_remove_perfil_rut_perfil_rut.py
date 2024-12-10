# Generated by Django 5.1.1 on 2024-10-19 19:44

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('trabajadores', '0002_perfil_rut'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='perfil',
            name='RUT',
        ),
        migrations.AddField(
            model_name='perfil',
            name='rut',
            field=models.CharField(default='0.000.000-0', max_length=12, unique=True),
            preserve_default=False,
        ),
    ]
