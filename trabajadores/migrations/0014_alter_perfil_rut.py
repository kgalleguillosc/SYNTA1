# Generated by Django 5.1.1 on 2024-11-06 13:12

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('trabajadores', '0013_alter_perfil_groups_alter_perfil_user_permissions'),
    ]

    operations = [
        migrations.AlterField(
            model_name='perfil',
            name='rut',
            field=models.CharField(max_length=12, unique=True),
        ),
    ]
