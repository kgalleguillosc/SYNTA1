# Generated by Django 5.1.1 on 2024-10-19 20:16

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('trabajadores', '0008_alter_perfil_rut'),
    ]

    operations = [
        migrations.AlterField(
            model_name='perfil',
            name='rut',
            field=models.CharField(max_length=12, unique=True),
        ),
    ]
