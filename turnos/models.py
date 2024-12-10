from django.db import models
from django.conf import settings



# Create your models here.
class Turno(models.Model):
    rut_trabajador = models.CharField(max_length=12)
    trabajador = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True)
    codigo_turno = models.CharField(max_length=10)
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()
    hora_inicio = models.TimeField(null=True, blank=True)  
    hora_fin = models.TimeField(null=True, blank=True)
    estado = models.CharField(
        max_length=20,
        choices=[
            ("NO_ASIGNADO", "No Asignado"),
            ("PENDIENTE", "Pendiente"),
            ("APROBADO", "Aprobado"),
            ("RECHAZADO", "Rechazado")
        ],
    )
    motivo_rechazo = models.TextField(blank=True, null=True)
    es_modificable = models.BooleanField(default=True)
    fecha_aprobacion = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ("rut_trabajador", "fecha_inicio", "fecha_fin")

    def __str__(self):
        return f"Turno {self.codigo_turno} - {self.rut_trabajador} del {self.fecha_inicio} al {self.fecha_fin} - Estado: {self.estado} - Fecha de aprobación: {self.fecha_aprobacion}"


