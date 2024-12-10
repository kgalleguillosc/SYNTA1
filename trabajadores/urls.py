from django.urls import path
from . import views
from django.contrib.auth import views as auth_views
urlpatterns = [
    path('buscar_trabajador/', views.buscar_trabajador, name='buscar_trabajador'),
    path('login/', views.login_view, name='login_view'),
    path('supervisor/', views.vista_supervisor, name='vista_supervisor'),
    path('coordinador/', views.vista_coordinador, name='vista_coordinador'),
    path('rrhh/', views.vista_rrhh, name='vista_rrhh'),
    path('ejecutivo/', views.vista_ejecutivo, name='vista_ejecutivo'),
    path('registro/', views.registro_view, name='registro'),
    path('password_reset/', auth_views.PasswordResetView.as_view(), name='password_reset'),
    path('password_reset/done/', auth_views.PasswordResetDoneView.as_view(), name='password_reset_done'),
    path('reset/<uidb64>/<token>/', auth_views.PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('reset/done/', auth_views.PasswordResetCompleteView.as_view(), name='password_reset_complete'),
    
   
]
