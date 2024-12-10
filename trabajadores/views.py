import pandas as pd
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib.auth import authenticate, login
from django.shortcuts import redirect, render
from django.contrib import messages
from datetime import datetime, timedelta
from django.utils import timezone
from django.core.serializers.json import DjangoJSONEncoder
from .forms import RegistroForm
from django.contrib.auth.models import Group
from turnos.models import Turno
import json
from trabajadores.models import Perfil
from .models import Perfil







# Create your views here.
# df_global= pd.read_excel(r'https://falabella.sharepoint.com/sites/Automatizacion_SAC/REPORTES_PYTHON/REPORTES_SAC/DOTACION_SEMANAL/SYNTA/DOTACION%20SYNTA.xlsx')
df_global=pd.read_excel(r'c:\Users\kgalleguillosc\Falabella\Automatizacion_SAC - REPORTES_PYTHON\REPORTES_SAC\DOTACION_SEMANAL\SYNTA\DOTACION SYNTA.xlsx')
#Vistas de los distintos perfiles
def es_ejecutivo(user):
    return user.rol == 'ejecutivo'
 
def es_supervisor(user):
    return user.rol == 'supervisor'

def es_coordinador(user):
    return user.rol == 'coordinador'

def es_rrhh(user):
    return user.rol == 'rrhh'


@login_required 
@user_passes_test(lambda u: u.rol in ['ejecutivo', 'supervisor', 'rrhh'])
def vista_ejecutivo(request):
    rut_ejecutivo = request.user.rut
    turnos = Turno.objects.filter(rut_trabajador=rut_ejecutivo)
    
    # Preparar turnos en formato JSON
    turnos_json = json.dumps([
        {
            'title': turno.codigo_turno,
            "start": f"{turno.fecha_inicio}T{turno.hora_inicio}",
            "end": f"{turno.fecha_fin}T{turno.hora_fin}"
        } for turno in turnos
    ], cls=DjangoJSONEncoder)
    
    contexto = {
        'turnos_json': turnos_json,
    }
    
    return render(request, 'vista_ejecutivo.html', contexto)

# @login_required 
# @user_passes_test(es_supervisor)
# def vista_supervisor(request):
#     # Obtén los departamentos a cargo del supervisor actual
#     departamentos_a_cargo = Perfil.objects.filter(supervisor=request.user).values_list('departamento', flat=True).distinct()
    
#     # Filtra los empleados de todos esos departamentos
#     personal_activo = Perfil.objects.filter(departamento__in=departamentos_a_cargo, rol__in=['supervisor', 'ejecutivo'])
#     print(f"Supervisor: {request.user.first_name} {request.user.last_name}")
#     print(f"Empleados en los departamentos a cargo del supervisor: {personal_activo.count()}")

#     today = timezone.now().date()
#     first_day_next_month = (today.replace(day=1) + timedelta(days=32)).replace(day=1)
#     last_day_next_month = (first_day_next_month + timedelta(days=32)).replace(day=1) - timedelta(days=1)

#     # Filtrar empleados de esos departamentos que no tienen turnos asignados para el próximo mes
#     empleados_sin_turno = personal_activo.exclude(
#         rut__in=Turno.objects.filter(
#             fecha_inicio__gte=first_day_next_month,
#             fecha_fin__lte=last_day_next_month
#         ).values_list('rut_trabajador', flat=True)
#     )

#     # Limpia el formato de RUT para los empleados
#     for empleado in personal_activo:
#         empleado.rut = limpiar_formato_rut(empleado.rut)

#     for empleado in empleados_sin_turno:
#         empleado.rut = limpiar_formato_rut(empleado.rut)

#     total_departamentos = departamentos_a_cargo.count()
#     print(f"Total de departamentos bajo el cargo del supervisor: {total_departamentos}")
#     lista_departamentos = [dep for dep in departamentos_a_cargo if dep]

#     # Contexto para pasar a la plantilla
#     context = {
#         'personal_activo': personal_activo,
#         'total_empleados': personal_activo.count(),
#         'turnos_pendientes': empleados_sin_turno.count(),
#         'empleados_pendientes': empleados_sin_turno,
#         'total_departamentos': total_departamentos,
#         'lista_departamentos': lista_departamentos,
#         'user': request.user
#     }

#     return render(request, 'Dashboard.html', context)

@login_required
@user_passes_test(es_supervisor)
def vista_supervisor(request):
    # Obtén los departamentos a cargo del supervisor actual
    departamentos_a_cargo = Perfil.objects.filter(supervisor=request.user).values_list('departamento', flat=True).distinct()

    # Filtra los empleados de esos departamentos, excluyendo al usuario actual
    personal_activo = Perfil.objects.filter(
        departamento__in=departamentos_a_cargo,
        rol__in=['supervisor', 'ejecutivo']
    ).exclude(id=request.user.id)

    today = timezone.now().date()
    first_day_next_month = (today.replace(day=1) + timedelta(days=32)).replace(day=1)
    last_day_next_month = (first_day_next_month + timedelta(days=32)).replace(day=1) - timedelta(days=1)

    # Generar lista de todos los días del mes siguiente
    dias_siguiente_mes = [first_day_next_month + timedelta(days=i) for i in range((last_day_next_month - first_day_next_month).days + 1)]

    empleados_sin_turno = []
    for empleado in personal_activo:
        # Obtener turnos del empleado para el próximo mes
        turnos_empleado = Turno.objects.filter(
            rut_trabajador=empleado.rut,
            fecha_inicio__gte=first_day_next_month,
            fecha_inicio__lte=last_day_next_month
        ).values_list('fecha_inicio', flat=True)

        # Convertir turnos a un conjunto de fechas
        turnos_asignados = set(turnos_empleado)

        # Verificar si hay algún día sin turno
        if not all(dia in turnos_asignados for dia in dias_siguiente_mes):
            empleados_sin_turno.append(empleado)

    # Formatear RUTs
    for empleado in personal_activo:
        empleado.rut = limpiar_formato_rut(empleado.rut)

    for empleado in empleados_sin_turno:
        empleado.rut = limpiar_formato_rut(empleado.rut)

    total_departamentos = personal_activo.values('departamento').distinct().count()
    departamentos = personal_activo.values_list('departamento', flat=True).distinct()
    lista_departamentos = [dep for dep in departamentos if dep]

    # Contexto para pasar a la plantilla
    context = {
        'personal_activo': personal_activo,
        'total_empleados': personal_activo.count(),
        'turnos_pendientes': len(empleados_sin_turno),
        'empleados_pendientes': empleados_sin_turno,
        'total_departamentos': total_departamentos,
        'lista_departamentos': lista_departamentos,
        'user': request.user
    }

    return render(request, 'Dashboard.html', context)




@login_required
@user_passes_test(es_coordinador)
def vista_coordinador(request):
    # Obtener los departamentos a cargo del coordinador actual
    departamentos_a_cargo = Perfil.objects.filter(supervisor=request.user).values_list('departamento', flat=True).distinct()

    # Filtra los empleados de esos departamentos, excluyendo al usuario actual
    personal_activo = Perfil.objects.filter(
        departamento__in=departamentos_a_cargo,
        rol__in=['supervisor', 'ejecutivo']
    ).exclude(id=request.user.id)

    today = timezone.now().date()
    first_day_next_month = (today.replace(day=1) + timedelta(days=32)).replace(day=1)
    last_day_next_month = (first_day_next_month + timedelta(days=32)).replace(day=1) - timedelta(days=1)

    # Generar lista de todos los días del mes siguiente
    dias_siguiente_mes = [first_day_next_month + timedelta(days=i) for i in range((last_day_next_month - first_day_next_month).days + 1)]

    empleados_sin_turno = []
    for empleado in personal_activo:
        # Obtener turnos del empleado para el próximo mes
        turnos_empleado = Turno.objects.filter(
            rut_trabajador=empleado.rut,
            fecha_inicio__gte=first_day_next_month,
            fecha_inicio__lte=last_day_next_month
        ).values_list('fecha_inicio', flat=True)

        # Convertir turnos a un conjunto de fechas
        turnos_asignados = set(turnos_empleado)

        # Verificar si hay algún día sin turno
        if not all(dia in turnos_asignados for dia in dias_siguiente_mes):
            empleados_sin_turno.append(empleado)

    # Formatear RUTs
    for empleado in personal_activo:
        empleado.rut = limpiar_formato_rut(empleado.rut)

    for empleado in empleados_sin_turno:
        empleado.rut = limpiar_formato_rut(empleado.rut)

    total_departamentos = personal_activo.values('departamento').distinct().count()
    departamentos = personal_activo.values_list('departamento', flat=True).distinct()
    lista_departamentos = [dep for dep in departamentos if dep]

    # Contexto para pasar a la plantilla
    context = {
        'personal_activo': personal_activo,
        'total_empleados': personal_activo.count(),
        'turnos_pendientes': len(empleados_sin_turno),
        'empleados_pendientes': empleados_sin_turno,
        'total_departamentos': total_departamentos,
        'lista_departamentos': lista_departamentos,
        'user': request.user
    }

    return render(request, 'Dashboard.html', context)







@login_required
@user_passes_test(es_rrhh)
def vista_rrhh(request):
    personal_activo = Perfil.objects.filter(
        rol__in=['ejecutivo', 'supervisor']
    ).exclude(id=request.user.id)

    today = timezone.now().date()
    first_day_next_month = (today.replace(day=1) + timedelta(days=32)).replace(day=1)
    last_day_next_month = (first_day_next_month + timedelta(days=32)).replace(day=1) - timedelta(days=1)

    # Generar lista de todos los días del mes siguiente
    dias_siguiente_mes = [first_day_next_month + timedelta(days=i) for i in range((last_day_next_month - first_day_next_month).days + 1)]

    empleados_sin_turno = []
    for empleado in personal_activo:
        # Obtener turnos del empleado para el próximo mes
        turnos_empleado = Turno.objects.filter(
            rut_trabajador=empleado.rut,
            fecha_inicio__gte=first_day_next_month,
            fecha_inicio__lte=last_day_next_month
        ).values_list('fecha_inicio', flat=True)

        # Convertir turnos a un conjunto de fechas
        turnos_asignados = set(turnos_empleado)

        # Verificar si hay algún día sin turno
        if not all(dia in turnos_asignados for dia in dias_siguiente_mes):
            empleados_sin_turno.append(empleado)

    # Formatear RUTs
    for empleado in personal_activo:
        empleado.rut = limpiar_formato_rut(empleado.rut)

    for empleado in empleados_sin_turno:
        empleado.rut = limpiar_formato_rut(empleado.rut)

    total_departamentos = personal_activo.values('departamento').distinct().count()
    departamentos = personal_activo.values_list('departamento', flat=True).distinct()
    lista_departamentos = [dep for dep in departamentos if dep]

    # Contexto para pasar a la plantilla
    context = {
        'personal_activo': personal_activo,
        'total_empleados': personal_activo.count(),
        'turnos_pendientes': len(empleados_sin_turno),
        'empleados_pendientes': empleados_sin_turno,
        'total_departamentos': total_departamentos,
        'lista_departamentos': lista_departamentos,
        'user': request.user
    }

    return render(request, 'Dashboard.html', context)






def login_view(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            print(f"Usuario autenticado: {user.username}, Rol: {user.rol}, Departamento: {user.departamento}")
            
            # Redirigir a la ruta correspondiente según el rol
            if user.rol == 'supervisor':
                return redirect('vista_supervisor')
            elif user.rol == 'coordinador':
                return redirect('vista_coordinador')
            elif user.rol == 'rrhh':
                return redirect('vista_rrhh')
            elif user.rol == 'ejecutivo':
                return redirect('vista_ejecutivo')
            else:
                messages.error(request, 'El usuario no tiene un perfil asignado.')
        else:
            messages.error(request, 'Usuario o contraseña incorrectos.')
    return render(request, 'inicio_sesion.html')

def registro_view(request):
    if request.method == 'POST':
        form = RegistroForm(request.POST)
        if form.is_valid():
            user = form.save()
             # Imprime para depurar si la contraseña se está cifrando
            print(f"Contraseña cifrada: {user.password}")
            rol_seleccionado = form.cleaned_data.get('rol')  
            
            if rol_seleccionado == 'ejecutivo':
                grupo = Group.objects.get(name='Ejecutivo')
            elif rol_seleccionado == 'supervisor':
                grupo = Group.objects.get(name='Supervisor')
            elif rol_seleccionado == 'coordinador':
                grupo = Group.objects.get(name='Coordinador')
            elif rol_seleccionado == 'rrhh':
                grupo = Group.objects.get(name='RRHH')

            user.groups.add(grupo)

            # Redirigir al inicio de sesión después de registrarse
            return redirect('inicio_sesion')  # Cambia 'login' por el nombre de tu vista de inicio de sesión

    else:
        form = RegistroForm()

    return render(request, 'Registro.html', {'form': form})



def formatear_rut(rut_completo):
    # Eliminar puntos, guiones y espacios del RUT
    rut_completo = rut_completo.replace(".", "").replace("-", "").replace(" ", "").upper()
    return rut_completo 


# Función que busca un trabajador en el archivo Excel cargado en memoria
def busquedaTrabajadorRUT(rut_completo):
    global df_global
    if df_global is None:
        return None
    
    try:
        # Formatear el RUT ingresado
        rut_completo = formatear_rut(rut_completo)

        # Extraer el dígito verificador
        rut_numero = rut_completo[:-1]  # Todos los caracteres excepto el último (el DV)
        rut_dv = rut_completo[-1].upper()      # El último carácter es el DV

        # Convertir el número de RUT a entero
        rut_numero = int(rut_numero)
        print(f"Buscando RUT: {rut_numero}-{rut_dv}")

        # Paso 1: Buscar el RUT sin el dígito verificador
        resultado_rut = df_global[df_global['Rut Del Empleado'] == rut_numero]

        if resultado_rut.empty:
            # Si no se encuentra el RUT, retornar un mensaje de error
            return {'error': 'RUT no encontrado'}
        
        print(f"Resultados del RUT: {resultado_rut}")

        # Paso 2: Buscar en el conjunto filtrado por el dígito verificador
        resultado_rut = resultado_rut.copy()
        resultado_rut['Digito Verificador'] = resultado_rut['Digito Verificador'].astype(str)

        trabajador = resultado_rut[resultado_rut['Digito Verificador'].str.upper() == rut_dv]
        
        if not trabajador.empty:
            trabajador_info = {
                'rut': int(trabajador.iloc[0]['Rut Del Empleado']),
                'dv': str(trabajador.iloc[0]['Digito Verificador']),
                'apellido_paterno': trabajador.iloc[0]['Apellido Paterno'],
                'apellido_materno': trabajador.iloc[0]['Apellido Materno'],
                'nombre': trabajador.iloc[0]['Nombre Empleado'],
                'cargo': trabajador.iloc[0]['Cargo'],
                'departamento': trabajador.iloc[0]['Departamento'],
                'tipo_jornada': int(trabajador.iloc[0]['Tipo Jornada']),
                'fecha_inicio': str(trabajador.iloc[0]['Fecha Inicio Contrato']),
                'fecha_termino': str(trabajador.iloc[0]['Fecha Termino Contrato']),
                'superior_nombre': trabajador.iloc[0]['Nombre Empleado Superior'],
                'superior_apellido': trabajador.iloc[0]['Apellido Paterno Empleado Superior'],
                'estado': trabajador.iloc[0]['Estado Del Empleado']
            }
            return trabajador_info
        else:
            return {'error': 'Trabajador no encontrado'}

    except ValueError:
        # Si el formato del RUT es incorrecto o no se puede convertir
        return {'error': 'Formato de RUT inválido'}

# Vista para manejar la solicitud y buscar trabajador
def buscar_trabajador(request):
    rut = request.GET.get('rut', None)
    if rut:
        trabajador_info = busquedaTrabajadorRUT(rut)
        if trabajador_info:
            print("Datos del trabajador encontrados", trabajador_info)
            return JsonResponse(trabajador_info)
        else:
            print("Trabajador no encontrado para RUT;", rut)
            return JsonResponse({'error': 'Trabajador no encontrado'}, status=404)
    return JsonResponse({'error': 'RUT no proporcionado'}, status=400)


import re

def limpiar_formato_rut(rut):
    # Eliminar todos los puntos y espacios del RUT
    rut = rut.replace(".", "").replace(" ", "")
    
    # Verificar si tiene el formato correcto usando regex
    match = re.match(r'^(\d+)-(\d|k|K)$', rut)
    if match:
        # Separar el número del dígito verificador
        numero = match.group(1)
        digito_verificador = match.group(2).upper()  # Convierte K a mayúscula si es necesario
        
        # Retornar el RUT en el formato deseado
        return f"{numero}-{digito_verificador}"
    else:
        raise ValueError("El RUT ingresado no tiene un formato válido")




