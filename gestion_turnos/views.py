from django.contrib.auth.views import LoginView
from django.shortcuts import render
import pandas as pd
from django.http import JsonResponse
import json
from django.contrib.auth.decorators import login_required
from django.contrib.auth import logout
from django.shortcuts import redirect
from django.views.decorators.cache import never_cache
from trabajadores.models import Perfil
from reportes.models import ReporteGenerado
from turnos.utils import obtener_estado_turno
from django.http import HttpResponseRedirect
from django.urls import reverse
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from trabajadores.forms import RegistroForm
from django.shortcuts import get_object_or_404
from trabajadores.forms import RegistroForm, EditarUsuarioForm
from trabajadores.models import Perfil
from turnos.models import   Turno





@login_required
@never_cache
def dashboard(request):
    # Lógica para redirigir según el rol del usuario
    if request.user.rol == 'supervisor':
        return redirect('/trabajadores/supervisor/')
    elif request.user.rol == 'coordinador':
        return redirect('/trabajadores/coordinador/')
    elif request.user.rol == 'rrhh':
        return redirect('/trabajadores/rrhh/')
    
    # Si el rol no es ninguno de los anteriores, renderizar el dashboard normal
    return render(request, 'Dashboard.html')



# @login_required
# @never_cache
# def empleados(request):
#     empleados_a_cargo = Perfil.objects.none()
#     if request.user.rol == 'supervisor':

#         departamentos_a_cargo = Perfil.objects.filter(supervisor=request.user).values_list('departamento', flat=True).distinct()

#         # Filtrar empleados según los departamentos obtenidos
#         empleados_a_cargo = Perfil.objects.filter(departamento__in=departamentos_a_cargo, rol__in=['supervisor', 'ejecutivo'])
#         print(f"Usuario: {request.user.first_name} {request.user.last_name}, Departamentos a cargo: {list(departamentos_a_cargo)}")
#         print(f"Empleados en los departamentos a cargo: {empleados_a_cargo.count()}")

#     elif request.user.rol == 'coordinador':
#         departamentos_a_cargo = Perfil.objects.filter(supervisor=request.user).values_list('departamento', flat=True).distinct()
#         empleados_a_cargo = Perfil.objects.filter(departamento__in=departamentos_a_cargo, rol__in=['supervisor', 'ejecutivo'])
#         # supervisores_bajo_cargo = Perfil.objects.filter(supervisor=request.user, rol='supervisor')
#         # print(f"Supervisores bajo el coordinador: {supervisores_bajo_cargo.count()}")

#         # empleados_bajo_supervisores = Perfil.objects.filter(supervisor__in=supervisores_bajo_cargo)
#         # print(f"Empleados bajo los supervisores: {empleados_bajo_supervisores.count()}")

#         # ejecutivos_directos = Perfil.objects.filter(supervisor=request.user, rol='ejecutivo')
#         # print(f"Ejecutivos bajo el coordinador: {ejecutivos_directos.count()}")

#         # empleados_a_cargo = supervisores_bajo_cargo | empleados_bajo_supervisores | ejecutivos_directos
#         # print(f"Total de empleados bajo el coordinador: {empleados_a_cargo.count()}")
#     elif request.user.rol == 'rrhh':
#         empleados_a_cargo = Perfil.objects.filter(rol__in=['ejecutivo', 'supervisor'])
#         print(f"Mostrando todos los empleados para RRHH: {empleados_a_cargo.count()}")

#     else:
#         empleados_a_cargo = Perfil.objects.none()
#         print("Usuario sin rol válido. No se muestran empleados.")

#     empleados_con_estado = []

#     for empleado in empleados_a_cargo:
#         # Obtener el turno más reciente del empleado
#         estado = obtener_estado_turno(empleado)
#         empleado.formatted_rut = empleado.rut.replace('.', '').replace('-', '')

        
#         empleado.full_name = f"{empleado.first_name.upper()} {empleado.last_name.upper()}"

#         empleados_con_estado.append({
#             "rut": empleado.rut,
#             "rut_f":empleado.formatted_rut,
#             "first_name": empleado.first_name,
#             "last_name": empleado.last_name,
#             "full_name": empleado.full_name,
#             "departamento": empleado.departamento,
#             "rol": empleado.rol,
#             "estado_turno": estado,
#         })

        

#     context = {
#         "empleados": empleados_con_estado
#     }
#     return render(request, 'Empleados.html', context)

@login_required
@never_cache
def empleados(request):
    empleados_a_cargo = Perfil.objects.none()
    if request.user.rol == 'supervisor':
        departamentos_a_cargo = Perfil.objects.filter(supervisor=request.user).values_list('departamento', flat=True).distinct()

        # Filtrar empleados según los departamentos obtenidos, excluyendo al usuario actual
        empleados_a_cargo = Perfil.objects.filter(
            departamento__in=departamentos_a_cargo,
            rol__in=['supervisor', 'ejecutivo']
        ).exclude(id=request.user.id)
        print(f"Usuario: {request.user.first_name} {request.user.last_name}, Departamentos a cargo: {list(departamentos_a_cargo)}")
        print(f"Empleados en los departamentos a cargo: {empleados_a_cargo.count()}")

    elif request.user.rol == 'coordinador':
        departamentos_a_cargo = Perfil.objects.filter(supervisor=request.user).values_list('departamento', flat=True).distinct()
        empleados_a_cargo = Perfil.objects.filter(
            departamento__in=departamentos_a_cargo,
            rol__in=['supervisor', 'ejecutivo']
        ).exclude(id=request.user.id)
        print(f"Usuario: {request.user.first_name} {request.user.last_name}, Departamentos a cargo: {list(departamentos_a_cargo)}")
        print(f"Empleados en los departamentos a cargo: {empleados_a_cargo.count()}")

    elif request.user.rol == 'rrhh':
        # Filtrar todos los empleados pero excluyendo al usuario actual
        empleados_a_cargo = Perfil.objects.filter(
            rol__in=['ejecutivo', 'supervisor']
        ).exclude(id=request.user.id)
        print(f"Mostrando todos los empleados para RRHH: {empleados_a_cargo.count()}")

    else:
        empleados_a_cargo = Perfil.objects.none()
        print("Usuario sin rol válido. No se muestran empleados.")

    empleados_con_estado = []

    for empleado in empleados_a_cargo:
        # Obtener el turno más reciente del empleado
        estado = obtener_estado_turno(empleado)
        empleado.formatted_rut = empleado.rut.replace('.', '').replace('-', '')
        empleado.full_name = f"{empleado.first_name.upper()} {empleado.last_name.upper()}"

        empleados_con_estado.append({
            "rut": empleado.rut,
            "rut_f": empleado.formatted_rut,
            "first_name": empleado.first_name,
            "last_name": empleado.last_name,
            "full_name": empleado.full_name,
            "departamento": empleado.departamento,
            "rol": empleado.rol,
            "estado_turno": estado,
        })

    context = {
        "empleados": empleados_con_estado
    }
    return render(request, 'Empleados.html', context)


 

@login_required
@never_cache
def reporte(request):
    reportes = ReporteGenerado.objects.filter(usuario=request.user) 
    print(f"Usuario actual: {request.user.username} - {request.user.rut}")
    context = {
        'reportes': reportes, 
    }

    return render(request, 'Reportes.html', context)
    

@login_required
@never_cache
def calendario_turnos(request):
    return render(request, 'calendario_turnos.html')


@never_cache
def inicio_sesion(request):
    return render(request, 'inicio_sesion.html')


@never_cache
def registro(request):
    return render(request, 'Registro.html')

@never_cache
def custom_logout(request):
    logout(request)
    return redirect('/inicio_sesion/') 


@never_cache
def calendario_general(request):
    empleados_a_cargo = Perfil.objects.none() 
    departamentos_a_cargo = []

    # Determinar los empleados y departamentos según el rol del usuario
    if request.user.rol == 'supervisor':
        empleados_a_cargo = Perfil.objects.filter(supervisor=request.user)
        departamentos_a_cargo = empleados_a_cargo.values_list('departamento', flat=True).distinct()
    elif request.user.rol == 'coordinador':
        supervisores_bajo_cargo = Perfil.objects.filter(supervisor=request.user, rol='supervisor')
        empleados_bajo_supervisores = Perfil.objects.filter(supervisor__in=supervisores_bajo_cargo)
        ejecutivos_directos = Perfil.objects.filter(supervisor=request.user, rol='ejecutivo')
        empleados_a_cargo = supervisores_bajo_cargo | empleados_bajo_supervisores | ejecutivos_directos
        departamentos_a_cargo = empleados_a_cargo.values_list('departamento', flat=True).distinct()
    elif request.user.rol == 'rrhh':
        empleados_a_cargo = Perfil.objects.filter(rol__in=['ejecutivo', 'supervisor'])
        departamentos_a_cargo = empleados_a_cargo.values_list('departamento', flat=True).distinct()

    # Crear una lista de empleados con el atributo `full_name`
    empleados_con_nombre = []
    for empleado in empleados_a_cargo:
        empleado.full_name = f"{empleado.first_name} {empleado.last_name}"
        empleados_con_nombre.append(empleado)

    # Obtener el RUT del trabajador si fue pasado como parámetro
    trabajador_rut = request.GET.get('trabajador', '')

    # Filtrar turnos asignados dependiendo del trabajador seleccionado
    if trabajador_rut:
        turnos_asignados = Turno.objects.filter(rut_trabajador=trabajador_rut).values('codigo_turno', 'fecha_inicio', 'hora_inicio', 'hora_fin')
    else:
        turnos_asignados = Turno.objects.filter(rut_trabajador__in=empleados_a_cargo.values_list('rut', flat=True)).values(
            'codigo_turno', 'fecha_inicio', 'hora_inicio', 'hora_fin'
        )

    # Convertir turnos a formato JSON
    turnos_json = json.dumps(list(turnos_asignados), default=str)

    # Pasar los empleados y los departamentos al contexto
    context = {
        "empleados": empleados_con_nombre,
        "departamentos": list(departamentos_a_cargo),  # Convertir el queryset a lista
        "trabajador_rut": trabajador_rut,  # Para preseleccionar el filtro inicial
        "turnos_json": turnos_json,  # JSON de turnos
    }

    return render(request, 'Calendario General.html', context)


@never_cache
def usuarios(request):
    usuarios = Perfil.objects.all()
    return render(request, 'Usuarios.html', {'usuarios': usuarios})







# Vista para agregar usuario
def agregar_usuario(request):
    if request.method == 'POST':
        form = RegistroForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('usuarios')  # Redirigir a la lista de usuarios
    else:
        form = RegistroForm()
    return render(request, 'AgregarUsuario.html', {'form': form})

# Vista para editar usuario
def editar_usuario(request, pk):
    usuario = get_object_or_404(Perfil, pk=pk)
    if request.method == 'POST':
        form = EditarUsuarioForm(request.POST, instance=usuario)
        if form.is_valid():
            form.save()
            return redirect('usuarios')  # Redirigir a la lista de usuarios
    else:
        form = EditarUsuarioForm(instance=usuario)
    return render(request, 'EditarUsuario.html', {'form': form})



@login_required
def eliminar_usuario(request, usuario_id):
    usuario = get_object_or_404(Perfil, id=usuario_id)

    if request.method == 'POST':  # Se activa solo al enviar el formulario
        usuario.delete()
        return HttpResponseRedirect(reverse('usuarios'))

    # Mostrar la página de confirmación en solicitudes GET
    return render(request, 'EliminarUsuario.html', {'usuario': usuario})
