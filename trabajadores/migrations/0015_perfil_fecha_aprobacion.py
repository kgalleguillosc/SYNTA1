# Generated by Django 5.1.1 on 2024-11-11 16:21

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('trabajadores', '0014_alter_perfil_rut'),
    ]

    operations = [
        migrations.AddField(
            model_name='perfil',
            name='fecha_aprobacion',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]