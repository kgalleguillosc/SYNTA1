# Generated by Django 5.1.1 on 2024-10-19 20:07

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('trabajadores', '0006_remove_perfil_rut'),
    ]

    operations = [
        migrations.AddField(
            model_name='perfil',
            name='rut',
            field=models.CharField(blank=True, max_length=12, null=True),
        ),
    ]
