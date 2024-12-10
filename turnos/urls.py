from django.urls import path
from . import views

urlpatterns = [
    path('calendario_turnos/', views.calendario_turnos, name='calendario_turnos'),
    path('api/guardar_turno/', views.guardar_turno, name='guardar_turno'),
    path('obtener_turnos/', views.obtener_turnos, name='obtener_turnos'),
    path('borrar_turno/<int:turno_id>/', views.borrar_turno, name='borrar_turno'),
    path('guardar_turno_masivo/', views.guardar_turno_masivo, name='guardar_turno_masivo'),
    path('aprobar_rechazar_turno/', views.aprobar_rechazar_turno, name='aprobar_rechazar_turno'),
    path('eliminar_turnos_mes_siguiente/<str:rut>/', views.eliminar_turnos_mes_siguiente, name='eliminar_turnos_mes_siguiente'),
    path('obtener_turnos_agrupados/', views.obtener_turnos_agrupados, name='obtener_turnos_agrupados'),
    path('obtener_resumen_turnos/', views.obtener_resumen_turnos, name='obtener_resumen_turnos'),
 
    

    
]

