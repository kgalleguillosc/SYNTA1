# Generated by Django 5.1.1 on 2024-10-29 17:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('trabajadores', '0011_perfil_supervisor'),
    ]

    operations = [
        migrations.AlterField(
            model_name='perfil',
            name='rut',
            field=models.CharField(max_length=12),
        ),
    ]
