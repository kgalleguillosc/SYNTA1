# Generated by Django 5.1.1 on 2024-11-07 23:48

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('turnos', '0007_delete_turnoaprobado'),
    ]

    operations = [
        migrations.AddField(
            model_name='turno',
            name='fecha_aprobacion',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]