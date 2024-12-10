"""
URL configuration for gestion_turnos project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from . import views
from django.http import HttpResponseRedirect
from django.contrib.auth import views as auth_views
from django.conf import settings
from django.conf.urls.static import static


urlpatterns = [
    path('admin/', admin.site.urls),
    path('accounts/', include('django.contrib.auth.urls')),
    path('logout/', views.custom_logout, name='logout'),
    path('inicio_sesion/', views.inicio_sesion, name='inicio_sesion'),  # Ruta a inicio_sesion
    path('', lambda request: HttpResponseRedirect('/inicio_sesion/')),
    path('trabajadores/', include('trabajadores.urls')),
    path('turnos/', include('turnos.urls')),
    path('reportes/', include('reportes.urls')),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('reporte/', views.reporte, name='reporte'),
    path('empleados/', views.empleados, name='empleados'),
    path('usuarios/', views.usuarios, name='usuarios'),
   path('usuarios/agregar/', views.agregar_usuario, name='agregar_usuario'),
    path('usuarios/editar/<int:pk>/', views.editar_usuario, name='editar_usuario'),
    path('usuarios/eliminar/<int:usuario_id>/', views.eliminar_usuario, name='eliminar_usuario'),
    path('calendario_turnos/', views.calendario_turnos, name='calendario_turnos'),
    path('calendario_general/', views.calendario_general, name= 'calendario_general'),
    
    
    
] 
# urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


