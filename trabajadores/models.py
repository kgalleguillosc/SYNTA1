from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.
class Perfil(AbstractUser):

    PERFILES = (
        ('ejecutivo', 'Ejecutivo'),
        ('supervisor', 'Supervisor'),
        ('coordinador', 'Coordinador'),
        ('rrhh', 'Administrador de RRHH'),
    )
    
    rol = models.CharField(max_length=15, choices=PERFILES)
    rut = models.CharField(max_length=12, unique=True)
    departamento = models.CharField(max_length=100)
    supervisor = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='empleados_a_cargo')
    
    

    def __str__(self):
        return f"{self.username} - {self.get_rol_display()}"
    

