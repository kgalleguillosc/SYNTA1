# Generated by Django 5.1.1 on 2024-10-21 18:16

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('trabajadores', '0009_alter_perfil_rut'),
    ]

    operations = [
        migrations.AddField(
            model_name='perfil',
            name='departamento',
            field=models.CharField(default=0, max_length=100),
            preserve_default=False,
        ),
    ]
