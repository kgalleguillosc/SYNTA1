from django import forms
from django.contrib.auth.forms import UserCreationForm
from .models import Perfil

class RegistroForm(UserCreationForm):
    class Meta:
        model = Perfil
        fields = ['username', 'first_name', 'last_name', 'email', 'rol', 'rut', 'departamento', 'supervisor']
        widgets = {
            'rol': forms.Select(attrs={'class': 'form-select'}),
            'departamento': forms.TextInput(attrs={'class': 'form-control'}),
            'rut': forms.TextInput(attrs={'class': 'form-control'}),
            'username': forms.TextInput(attrs={'class': 'form-control'}),
            'first_name': forms.TextInput(attrs={'class': 'form-control'}),
            'last_name': forms.TextInput(attrs={'class': 'form-control'}),
            'email': forms.EmailInput(attrs={'class': 'form-control'}),
            'supervisor': forms.Select(attrs={'class': 'form-select'}),
        }



class EditarUsuarioForm(forms.ModelForm):
    class Meta:
        model = Perfil
        fields = ['username', 'email', 'rol', 'rut', 'departamento', 'supervisor']
        widgets = {
            'rol': forms.Select(attrs={'class': 'form-select'}),
            'departamento': forms.TextInput(attrs={'class': 'form-control'}),
            'rut': forms.TextInput(attrs={'class': 'form-control'}),
            'username': forms.TextInput(attrs={'class': 'form-control'}),
            'email': forms.EmailInput(attrs={'class': 'form-control'}),
            'supervisor': forms.Select(attrs={'class': 'form-select'}),
        }


def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Filtrar solo usuarios con rol 'Supervisor' o 'Coordinador'
        self.fields['supervisor'].queryset = Perfil.objects.filter(rol__in=['supervisor', 'coordinador'])