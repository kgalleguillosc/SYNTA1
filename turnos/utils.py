from datetime import datetime
from dateutil.relativedelta import relativedelta
from .models import Turno

def obtener_estado_turno(trabajador):
    # Obtener el primer día del mes siguiente
    fecha_actual = datetime.today()
    mes_siguiente = (fecha_actual + relativedelta(months=1)).replace(day=1)

    # Verificar si el trabajador tiene turnos asignados para el próximo mes
    turno = Turno.objects.filter(
        rut_trabajador=trabajador.rut,
        fecha_inicio__year=mes_siguiente.year,
        fecha_inicio__month=mes_siguiente.month
    ).first()

    # Determinar el estado basado en el estado del turno
    if turno:
        if turno.estado == "APROBADO":
            return "Aprobado"
        elif turno.estado == "RECHAZADO":
            return "Rechazado"
        else:
            return "Pendiente"
    else:
        return "No Asignado"
    
def obtener_estado_turnos_mes(turnos):
    # Verifica el estado de los turnos del mes
    estados = set(turno.estado for turno in turnos)
    if len(estados) == 1:
        return estados.pop()  # Devuelve el estado si todos los turnos tienen el mismo estado
    return "Pendiente"  # Si hay una mezcla de estados, consideramos "Pendiente" como estado general



