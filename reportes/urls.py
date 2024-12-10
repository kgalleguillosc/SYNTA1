from django.urls import path
from . import views
from .views import  ReportePersonasExcel, ReporteTurnosExcelTALANA, ReporteTurnosExcel

urlpatterns = [
    path('reporte-personas/',  ReportePersonasExcel.as_view(), name='Reporte_Personas_Excel'),
    path('reporte-turnos/',  ReporteTurnosExcel.as_view(), name='Reporte_Turnos_Excel'),
    path('reporte-turnos-TALANA/',  ReporteTurnosExcelTALANA.as_view(), name='Reporte_Turnos_Excel_TALANA'),
    # path('reporte/', HistorialReportesView.as_view(), name='reporte'),

]
  
