import pandas as pd
from trabajadores.models import Perfil
from django.core.management.base import BaseCommand
from django.contrib.auth.hashers import make_password
import unicodedata
import schedule
import time

class Command(BaseCommand):
    help = 'Importar usuarios desde un archivo Excel'

    def format_rut(self, rut, dv):
        """Formatea el RUT con puntos y guion."""
        rut = str(rut)
        formatted_rut = f"{rut[:-6]}.{rut[-6:-3]}.{rut[-3:]}-{dv}"
        return formatted_rut

    def create_username(self, nombre, apellido):
        """Crea un username con el formato nombre-apellido y reemplaza los espacios por guiones."""
        username = f"{nombre.lower()}_{apellido.lower()}".replace(' ', '_')
        return username

    def normalizar_texto(self, texto):
        """Normaliza el texto: quita solo los acentos, convierte a mayúsculas, mantiene la ñ."""
        texto = ''.join(
            c for c in unicodedata.normalize('NFD', texto)
            if unicodedata.category(c) != 'Mn' or c == 'ñ'
        )
        return texto.upper().strip()

    def determinar_rol(self, cargo):
        """Determina el rol basado en si el cargo contiene las palabras clave."""
        cargo = cargo.lower().strip()
        if 'ejecutivo' in cargo:
            return 'ejecutivo'
        elif 'supervisor' in cargo:
            return 'supervisor'
        elif 'coordinador' in cargo:
            return 'coordinador'
        elif 'rrhh' in cargo or 'recursos humanos' in cargo:
            return 'rrhh'
        else:
            return 'ejecutivo'

    def crear_usuario(self, row):
        """Crea un usuario basado en la fila de datos."""
        rut = row['Rut Del Empleado']
        dv = row['Digito Verificador']
        nombre = row['Nombre Empleado']
        apellido = row['Apellido Paterno']
        departamento = row['Departamento']
        cargo = row['Cargo']

        # Crear el RUT formateado
        rut_formateado = self.format_rut(rut, dv)

        # Crear el username usando nombre y apellido
        username = self.create_username(nombre, apellido)

        # Determinar el rol basado en el cargo
        rol = self.determinar_rol(cargo)

        # Crear el usuario si no existe en el modelo Perfil
        if not Perfil.objects.filter(username=username).exists():
            perfil = Perfil.objects.create(
                username=username,
                first_name=nombre,
                last_name=apellido,
                rut=rut_formateado,
                departamento=departamento,
                rol=rol,
                password=make_password('N3r!oT1x#L9dZp')  # Contraseña segura
            )
            self.stdout.write(self.style.SUCCESS(f'Usuario {username} creado con éxito.'))
            return perfil
        else:
            self.stdout.write(self.style.WARNING(f'Usuario {username} ya existe.'))
            return Perfil.objects.get(username=username)

    def buscar_supervisor(self, nombre_superior, apellido_superior):
        """Busca al supervisor en la base de datos con diversas combinaciones."""
        supervisor = None
        
        # Intentar primero una búsqueda exacta por nombre y apellido
        supervisor = Perfil.objects.filter(
            first_name__iexact=nombre_superior,
            last_name__iexact=apellido_superior
        ).first()

        # Si no lo encuentra, intentar con `icontains` para mayor flexibilidad en la búsqueda
        if not supervisor:
            supervisor = Perfil.objects.filter(
                first_name__icontains=nombre_superior.split()[0],
                last_name__icontains=apellido_superior
            ).first()

        # Si no lo encuentra aún, probar con la segunda parte del nombre si existe
        if not supervisor and len(nombre_superior.split()) > 1:
            segundo_nombre = nombre_superior.split()[1]
            supervisor = Perfil.objects.filter(
                first_name__icontains=segundo_nombre,
                last_name__icontains=apellido_superior
            ).first()

        return supervisor

    def handle(self, *args, **kwargs):
        # Ruta del archivo Excel
        file_path = r'c:\Users\kgalleguillosc\Falabella\Automatizacion_SAC - REPORTES_PYTHON\REPORTES_SAC\DOTACION_SEMANAL\SYNTA\DOTACION SYNTA.xlsx'
        
        # Leer el archivo Excel
        df = pd.read_excel(file_path, engine='openpyxl')

        # Limpiar las columnas relevantes
        df['Rut Del Empleado'] = df['Rut Del Empleado'].astype(str).str.strip()
        df['Digito Verificador'] = df['Digito Verificador'].astype(str).str.strip()
        df['Nombre Empleado'] = df['Nombre Empleado'].str.strip().str.title()
        df['Apellido Paterno'] = df['Apellido Paterno'].str.strip().str.title()
        df['Departamento'] = df['Departamento'].str.strip().str.title()
        df['Cargo'] = df['Cargo'].str.strip()

        # Primero creamos a todos los supervisores y coordinadores
        for index, row in df.iterrows():
            cargo = row['Cargo'].strip().lower()
            if 'supervisor' in cargo or 'coordinador' in cargo:
                self.crear_usuario(row)

        # Luego creamos al resto de empleados y asignamos supervisores
        for index, row in df.iterrows():
            nombre_superior = row['Nombre Empleado Superior'].strip()
            apellido_superior = row['Apellido Paterno Empleado Superior'].strip()

            # Normalizar nombres y apellidos
            nombre_superior_normalizado = self.normalizar_texto(nombre_superior)
            apellido_superior_normalizado = self.normalizar_texto(apellido_superior)

            # Buscar al supervisor
            supervisor = self.buscar_supervisor(nombre_superior_normalizado, apellido_superior_normalizado)
            
            if not supervisor:
                self.stdout.write(self.style.WARNING(f'Supervisor {nombre_superior_normalizado} {apellido_superior_normalizado} no encontrado. Asignando None.'))
                supervisor = None
            else:
                self.stdout.write(self.style.SUCCESS(f'Supervisor encontrado: {supervisor.first_name} {supervisor.last_name}'))

            # Crear el usuario y asignar el supervisor
            empleado = self.crear_usuario(row)
            if supervisor:
                empleado.supervisor = supervisor
                empleado.save()


# schedule.every(2).days.do(Command)
# while True:
#     schedule.run_pending()
#     time.sleep(1)