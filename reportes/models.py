from django.db import models
from django.db import models
from django.conf import settings
from trabajadores.models import Perfil

# Create your models here.

class ReporteGenerado(models.Model):
    TIPO_REPORTE_CHOICES = [
        ('turnos', 'Reporte de Turnos'),
        ('usuarios', 'Reporte de Usuarios'),
        ('talana', 'Reporte TALANA'),
    ]
    usuario = models.ForeignKey(Perfil, on_delete=models.CASCADE, null=True, blank=True) 
    tipo_reporte = models.CharField(max_length=20, choices=TIPO_REPORTE_CHOICES)
    departamento = models.CharField(max_length=100, blank=True, null=True)
    fecha_inicio = models.DateField(blank=True, null=True)
    fecha_fin = models.DateField(blank=True, null=True)
    fecha_generacion = models.DateTimeField(auto_now_add=True)
    archivo_reporte = models.FileField(upload_to='reporte/')

    def __str__(self):
        return f"{self.get_tipo_reporte_display()} - {self.fecha_generacion.strftime('%Y-%m-%d %H:%M:%S')}"



   