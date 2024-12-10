from .models import Turno
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.mail import send_mail
from django.conf import settings
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
import json
from django.db.models import Count
from django.http import JsonResponse
from .models import Turno
from trabajadores.models import Perfil
import pandas as pd
from django.utils import timezone
from datetime import timedelta
from django.db.models import Q

# Create your views here.
HORARIOS_TURNOS = {
    "A10": { "inicio": "09:00", "fin": "18:00" },
    "P22": { "inicio": "09:00", "fin": "13:00" },
    "A11": { "inicio": "08:30", "fin": "18:30" },
    "A13": { "inicio": "09:00", "fin": "17:00" },
    "P28": { "inicio": "09:00", "fin": "16:00" },
    "A14": { "inicio": "10:00", "fin": "19:00" },
    "A16": { "inicio": "11:00", "fin": "17:00" },
    "A18": { "inicio": "09:00", "fin": "14:00" },
    "A2": { "inicio": "09:00", "fin": "19:00" },
    "TE39": { "inicio": "10:00", "fin": "19:00" },
    "A3": { "inicio": "11:00", "fin": "21:00" },
    "A35": { "inicio": "10:00", "fin": "15:00" },
    "A36": { "inicio": "10:30", "fin": "19:00" },
    "TE51": { "inicio": "11:30", "fin": "19:00" },
    "A5": { "inicio": "09:00", "fin": "20:00" },
    "A57": { "inicio": "08:00", "fin": "16:00" },
    "A6": { "inicio": "10:00", "fin": "21:00" },
    "A68": { "inicio": "14:00", "fin": "21:00" },
    "A7": { "inicio": "09:00", "fin": "15:00" },
    "A8": { "inicio": "15:00", "fin": "21:00" },
    "B10": { "inicio": "15:30", "fin": "21:00" },
    "B14": { "inicio": "09:30", "fin": "15:30" },
    "F54": { "inicio": "10:00", "fin": "18:00" },
    "TE48": { "inicio": "10:00", "fin": "17:00" },
    "P07": { "inicio": "12:30", "fin": "21:00" },
    "A60": { "inicio": "13:30", "fin": "21:00" },
    "P37": { "inicio": "08:00", "fin": "18:00" },
    "P38": { "inicio": "08:30", "fin": "17:30" },
    "P50": { "inicio": "10:00", "fin": "20:00" },
    "P57": { "inicio": "11:30", "fin": "21:00" },
    "F52": { "inicio": "11:00", "fin": "19:30" },
    "A41": { "inicio": "12:00", "fin": "19:30" },
    "DES": { "inicio": None, "fin": None }
}


def calendario_turnos(request):
    rut = request.GET.get('rut', 'No RUT provided')
    return render(request, 'calendario_turnos.html', {'rut': rut})

@csrf_exempt
def guardar_turno(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        rut = data.get('rut')
        codigo = data.get('codigo')
        fecha_inicio = data.get('inicio')
        fecha_fin = data.get('fin')
        horario = HORARIOS_TURNOS.get(codigo)

        if horario:
            nuevo_turno = Turno(
                rut_trabajador=rut,
                codigo_turno=codigo,
                fecha_inicio=fecha_inicio,
                fecha_fin=fecha_fin,
                hora_inicio=horario["inicio"],
                hora_fin=horario["fin"],
                estado="PENDIENTE"
            )
            nuevo_turno.save()
            return JsonResponse({'success': True, 'id': nuevo_turno.id})
    
    return JsonResponse({'success': False, 'error': 'Método no permitido'}, status=405)


@csrf_exempt 
def guardar_turno_masivo(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            ruts = data.get('ruts', [])
            codigo_turno = data.get('codigo_turno')
            fecha_inicio = datetime.strptime(data.get('inicio'), '%Y-%m-%d').date()
            fecha_fin = datetime.strptime(data.get('fin'), '%Y-%m-%d').date()

            for rut in ruts:
                # Iterar sobre el rango de fechas y crear un turno por cada día
                current_date = fecha_inicio
                while current_date <= fecha_fin:
                    Turno.objects.create(
                        rut_trabajador=rut,
                        codigo_turno=codigo_turno,
                        fecha_inicio=current_date,
                        fecha_fin=current_date,
                        estado="PENDIENTE"
                    )
                    current_date += timedelta(days=1)

            return JsonResponse({'success': True, 'message': 'Turnos asignados exitosamente.'})

        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})

    return JsonResponse({'success': False, 'message': 'Método no permitido.'})



#Vista para que Fullcalendar muestre los turnos en el calendario
def obtener_turnos(request):
    turnos = Turno.objects.all()
    turnos_json = []
    

    for turno in turnos:
         turnos_json.append({
            'id': turno.id,
            'rut': turno.rut_trabajador,
            'title': turno.codigo_turno,
            'start': f"{turno.fecha_inicio}T{turno.hora_inicio}",
            'end': f"{turno.fecha_fin}T{turno.hora_fin}",
            'allDay': False,
            'estado': turno.estado,
            'fecha_aprobacion': turno.fecha_aprobacion
        })
    return JsonResponse(turnos_json, safe=False)

def borrar_turno(request, turno_id):
    if request.method == 'DELETE':
        try:
            turno = Turno.objects.get(id=turno_id)
            turno.delete()
            return JsonResponse({'success': True, 'message': 'Turno eliminado correctamente'})
        except Turno.DoesNotExist:
            return JsonResponse({'success': False, 'message': 'Turno no encontrado'}, status=404)
    return JsonResponse({'success': False, 'message': 'Método no permitido'}, status=405)


#VISTA PARA EL ESTADO DE TURNOS ASIGNADO O NO 
def aprobar_rechazar_turno(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        rut = data.get('rut')  # Recibe un solo RUT
        nuevo_estado = data.get('estado', 'APROBADO')
        motivo_rechazo = data.get('motivo_rechazo', '')

        if nuevo_estado not in ["APROBADO", "RECHAZADO"]:
            return JsonResponse({'success': False, 'message': 'Estado inválido'})

        # Obtener el primer día del mes siguiente
        hoy = timezone.now()
        primer_dia_mes_siguiente = (hoy.replace(day=1) + timedelta(days=32)).replace(day=1)

        # Ajustar último día del mes siguiente al final del día
        ultimo_dia_mes_siguiente = (primer_dia_mes_siguiente + timedelta(days=32)).replace(day=1) - timedelta(seconds=1)

        try:
            # Filtra todos los turnos pendientes del trabajador en el mes siguiente
            turnos = Turno.objects.filter(
                rut_trabajador=rut,
                estado="PENDIENTE",
                fecha_inicio__gte=primer_dia_mes_siguiente,
                fecha_inicio__lte=ultimo_dia_mes_siguiente
            )

            if not turnos.exists():
                return JsonResponse({'success': False, 'message': 'No se encontraron turnos pendientes para este RUT en el mes siguiente'})

            # Actualiza el estado de cada turno encontrado
            for turno in turnos:
                turno.estado = nuevo_estado
                if nuevo_estado == "APROBADO":
                    turno.fecha_aprobacion = timezone.now()
                elif nuevo_estado == "RECHAZADO":
                    turno.motivo_rechazo = motivo_rechazo
                turno.save()

            # Si el turno fue rechazado, enviar un correo electrónico
            if nuevo_estado == "RECHAZADO":
                # Obtener datos del empleado
                empleado = Perfil.objects.get(rut=rut)
                nombre_empleado = f"{empleado.first_name} {empleado.last_name}"

                # Buscar el supervisor directo
                supervisor = empleado.supervisor  # Supón que `Perfil` tiene un campo `supervisor` (FK)
                if supervisor and supervisor.email:
                    # Mensaje del correo
                    asunto = "Notificación de Rechazo de Turno"
                    mensaje = (
                        f"El turno del trabajador {rut} - {nombre_empleado} ha sido rechazado.\n"
                        f"Motivo: {motivo_rechazo}\n"
                        f"Por favor, gestione la asignación de un nuevo turno."
                    )

                    # Enviar correo al supervisor
                    send_mail(
                        asunto,
                        mensaje,
                        settings.DEFAULT_FROM_EMAIL,  # Correo desde donde se envía
                        [supervisor.email],  # Supervisor directo
                    )

            return JsonResponse({'success': True, 'message': f'Turnos {nuevo_estado.lower()}s correctamente.'})

        except Exception as e:
            return JsonResponse({'success': False, 'message': str(e)})

    return JsonResponse({'success': False, 'message': 'Método no permitido'})

#PARTE DE MODIFICACIONES
def eliminar_turnos_mes_siguiente(request, rut):
    # Confirmamos que el `rut` en la solicitud coincide con el formato en la base de datos
    
    if request.method == "POST":
        # Obtener el primer día del mes siguiente
        fecha_actual = datetime.today()
        mes_siguiente = (fecha_actual + relativedelta(months=1)).replace(day=1)

        # Filtrar turnos con el `rut` exacto como está almacenado
        turnos_a_eliminar = Turno.objects.filter(
            rut_trabajador=rut,
            fecha_inicio__year=mes_siguiente.year,
            fecha_inicio__month=mes_siguiente.month
        )

        if turnos_a_eliminar.exists():
            turnos_a_eliminar.delete()
            return JsonResponse({
                'success': True, 
                'message': f'Turnos de {rut} para {mes_siguiente.month}/{mes_siguiente.year} eliminados'
            })
        else:
            return JsonResponse({
                'success': False, 
                'message': f'No se encontraron turnos para {rut} en {mes_siguiente.month}/{mes_siguiente.year}'
            })

    return JsonResponse({'success': False, 'message': 'Método no permitido'}, status=405)




def obtener_turnos_agrupados(request):
    user = request.user

    # Inicializamos el queryset de empleados a cargo
    empleados_a_cargo = Perfil.objects.none()

    if user.rol == 'supervisor':
        empleados_a_cargo = Perfil.objects.filter(supervisor=user)
    elif user.rol == 'coordinador':
        departamentos_a_cargo = Perfil.objects.filter(supervisor=user).values_list('departamento', flat=True).distinct()
        empleados_a_cargo = Perfil.objects.filter(departamento__in=departamentos_a_cargo, rol__in=['supervisor', 'ejecutivo'])
    elif user.rol == 'rrhh':
        empleados_a_cargo = Perfil.objects.filter(rol__in=['ejecutivo', 'supervisor'])

    # Filtrar turnos aprobados de empleados a cargo
    # turnos = Turno.objects.filter(estado="APROBADO", rut_trabajador__in=empleados_a_cargo.values_list('rut', flat=True))
    turnos = Turno.objects.filter(
        Q(estado="APROBADO") | Q(estado="PENDIENTE"),  # Filtrar turnos con estado "APROBADO" o "PENDIENTE"
        rut_trabajador__in=empleados_a_cargo.values_list('rut', flat=True)  # Restringir por empleados a cargo
    )
    # Obtener los parámetros de filtro de la solicitud GET
    departamento = request.GET.get('departamento', '')
    turno = request.GET.get('turno', '')
    trabajador = request.GET.get('trabajador', '')
    fecha_inicio = request.GET.get('fecha_inicio', '')
    fecha_fin = request.GET.get('fecha_fin', '')

    # Crear un diccionario de empleados con nombre completo
    empleados = Perfil.objects.all()
    empleados_dict = {
        empleado.rut: {
            'nombre_completo': f"{empleado.first_name.upper()} {empleado.last_name.upper()}",
            'departamento': empleado.departamento
        }
        for empleado in empleados
    }
    print(empleados_dict)

    if departamento:
        ruts_departamento = [rut for rut, data in empleados_dict.items() if data['departamento'] == departamento]
        turnos = turnos.filter(rut_trabajador__in=ruts_departamento)
        print(f"Departamento seleccionado: {departamento}")
        print(f"RUTs encontrados para el departamento: {ruts_departamento}")


    if trabajador:
        turnos = turnos.filter(rut_trabajador=trabajador)

    if turno:
        turnos = turnos.filter(codigo_turno=turno)
   
    if fecha_inicio and fecha_fin:
        turnos = turnos.filter(fecha_inicio__gte=fecha_inicio, fecha_fin__lte=fecha_fin)

    # Agrupar los turnos por fecha, hora de inicio y hora de fin
    turnos_agrupados = (
        turnos.values('fecha_inicio', 'hora_inicio', 'hora_fin', 'codigo_turno')
        .annotate(cantidad=Count('codigo_turno'))
        .order_by('fecha_inicio', 'hora_inicio')
    )



    # Diccionario de colores para los turnos
    colores_turnos = {
        "A10": "#1E90FF", "A11": "#1E90FF", "A13": "#1E90FF", "A14": "#1E90FF", "A16": "#1E90FF",
        "A18": "#1E90FF", "A2": "#1E90FF", "A3": "#1E90FF", "A35": "#1E90FF", "A36": "#1E90FF",
        "A5": "#1E90FF", "A57": "#1E90FF", "A6": "#1E90FF", "A68": "#1E90FF", "A7": "#1E90FF",
        "A8": "#1E90FF", "A41": "#1E90FF", "B10": "#FF6347", "B14": "#FF6347", 
        "P22": "#32CD32", "P28": "#32CD32", "P07": "#32CD32", "P37": "#32CD32", 
        "P38": "#32CD32", "P50": "#32CD32", "P57": "#32CD32", 
        "TE39": "#9370DB", "TE51": "#9370DB", "TE48": "#9370DB",
        "F54": "#FFD700", "F52": "#FFD700", "DES": "#FFA500 "
    }

    # Crear el JSON de eventos para el calendario
    turnos_json = []
    for turno in turnos_agrupados:
        trabajadores = list(
            turnos.filter(fecha_inicio=turno['fecha_inicio'], codigo_turno=turno['codigo_turno'])
            .values('rut_trabajador')
        )
        
        # Construir la lista de trabajadores con información adicional
        trabajadores_info = [
            {
                'rut_trabajador': trabajador['rut_trabajador'],
                'nombre': empleados_dict.get(trabajador['rut_trabajador'], {}).get('nombre_completo', "DESCONOCIDO"),
                'departamento': empleados_dict.get(trabajador['rut_trabajador'], {}).get('departamento', "SIN DEPARTAMENTO")
            }
            for trabajador in trabajadores
        ]

        # Determinar si el turno es un día de descanso (DES)
        is_all_day = True if turno['codigo_turno'] == 'DES' else False
        
        # Obtener color de turno del diccionario
        color_turno = colores_turnos.get(turno['codigo_turno'], "#007bff")  # Color por defecto: azul

        turnos_json.append({
            'title': f"{turno['cantidad']} Turnos {turno['codigo_turno']}",
            'start': f"{turno['fecha_inicio']}T{turno['hora_inicio']}" if not is_all_day else turno['fecha_inicio'],
            'end': f"{turno['fecha_inicio']}T{turno['hora_fin']}" if not is_all_day else turno['fecha_inicio'],
            'backgroundColor': color_turno if is_all_day else None,
            'borderColor': color_turno,
            'allDay': is_all_day,
            'trabajadores': trabajadores_info  # Incluye tanto RUT como nombre completo
        })

    return JsonResponse(turnos_json, safe=False)



    
def obtener_resumen_turnos(request):
    empleados_a_cargo = Perfil.objects.filter(supervisor=request.user)
    
    resumen = {
        'aprobados': empleados_a_cargo.filter(estado_turno="Aprobado").count(),
        'pendientes': empleados_a_cargo.filter(estado_turno="Pendiente").count(),
        'rechazados': empleados_a_cargo.filter(estado_turno="Rechazado").count(),
        'no_asignados': empleados_a_cargo.filter(estado_turno="No Asignado").count(),
    }
    return JsonResponse(resumen)


def obtener_recursos(request):
    recursos = [
        {
            'id': turno_codigo,  # El código del turno como ID del recurso
            'title': f"Turno {turno_codigo} ({horario['inicio']} - {horario['fin']})"
        } for turno_codigo, horario in HORARIOS_TURNOS.items() if horario['inicio'] and horario['fin']
    ]
    return JsonResponse(recursos, safe=False)


def obtener_eventos(request):
    turnos = Turno.objects.all()
    eventos = [
        {
            'id': turno.id,
            'title': f"{turno.codigo_turno} ({turno.rut_trabajador})",
            'start': f"{turno.fecha_inicio}T{turno.hora_inicio}",
            'end': f"{turno.fecha_fin}T{turno.hora_fin}",
            'resourceId': turno.codigo_turno,  # Asociar al recurso correspondiente
        }
        for turno in turnos
    ]
    return JsonResponse(eventos, safe=False)
