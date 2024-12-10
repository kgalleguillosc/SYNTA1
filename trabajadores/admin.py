from django.contrib import admin
from .models import Perfil
from django.contrib.auth.admin import UserAdmin
from django import forms


# Register your models here.

class PerfilForm(forms.ModelForm):
    class Meta:
        model = Perfil
        fields = '__all__'

    # Filtrar supervisores y coordinadores
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Filtrar solo supervisores y coordinadores
        self.fields['supervisor'].queryset = Perfil.objects.filter(rol__in=['supervisor', 'coordinador'])

class PerfilAdmin(UserAdmin):
    form = PerfilForm
    list_display = ('username', 'rut', 'email', 'first_name', 'last_name', 'rol', 'departamento', 'supervisor')
    search_fields = ('username', 'rut', 'email', 'first_name', 'last_name', 'rol', 'departamento')
    list_filter = ('rol', 'departamento')
    fieldsets = (
        (None, {'fields': ('username', 'password', 'rol', 'supervisor')}),
        ('Información personal', {'fields': ('first_name', 'last_name', 'email', 'rut', 'departamento')}),
        ('Permisos', {'fields': ('is_active', 'is_staff', 'is_superuser')}),
        ('Fechas importantes', {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'first_name', 'last_name', 'email', 'rol', 'rut', 'departamento', 'supervisor', 'password1', 'password2'),
        }),
    )

admin.site.register(Perfil, PerfilAdmin)
