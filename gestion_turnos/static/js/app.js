document.addEventListener('DOMContentLoaded', function() {
    // ===================== UTILIDADES GENERALES =========================
    // Obtener el año actual
    const currentYear = new Date().getFullYear();
    const yearElement = document.getElementById('currentYear');
    if (yearElement) {
        yearElement.textContent = currentYear;
    }

    // Función para formatear el RUT combinando el número y el dígito verificador
    function formatearRUTConDV(rut, dv) {
        const rutLimpio = rut.toString().replace(/[^\d]/g, '');
        const dvLimpio = dv.toUpperCase();
        const rutFormateado = rutLimpio.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        return `${rutFormateado}-${dvLimpio}`;
    }



    // Función para mostrar el mensaje de error en la sección correcta
    function mostrarError(mensaje, tipoAsignacion) {
        let errorMsg;
        let errorList;
    
        if (tipoAsignacion === 'individual') {
            errorMsg = document.getElementById("errorMsgIndividual");
        } else if (tipoAsignacion === 'masiva') {
            errorMsg = document.getElementById("errorMsgMasivo");
            errorList = document.getElementById("errorListMasivo");
            if (!errorList) {
                console.error('El contenedor errorListMasivo no existe en el DOM.');
                return;  // Salir de la función si no se encuentra el elemento
            }
            errorList.innerHTML = '';  
        }
    
        if (errorMsg) {
            if (tipoAsignacion === 'masiva' && Array.isArray(mensaje)) {
                mensaje.forEach(err => {
                    const listItem = document.createElement('li');
                    listItem.textContent = err; 
                    errorList.appendChild(listItem);
                });
            } else {
                errorMsg.innerText = mensaje; 
            }
    
            errorMsg.style.display = "block"; // Mostrar el mensaje
    
            // Ocultar después de 5 segundos
            setTimeout(function() {
                errorMsg.style.display = 'none';
            }, 5000);
        }
    }



    // ==================== ASIGNACIÓN INDIVIDUAL =========================
    // Referencias a los elementos
    const asignacionIndividualBox = document.getElementById('option-individual');  // Caja de selección para asignación individual
    const asignacionMasivaBox = document.getElementById('option-masiva');  // Caja de selección para asignación masiva
    const asignacionIndividualForm = document.getElementById('asignacionIndividual');  // Formulario de asignación individual
    const asignacionMasivaForm = document.getElementById('asignacionMasiva');  // Formulario de asignación masiva

    // Función para limpiar los detalles del empleado
    function limpiarDetallesEmpleado() {
        // Limpiar campos de detalles de empleado individual
        document.getElementById("employeeFullName").innerText = "";
        document.getElementById("employeeRUT").innerText = "";
        document.getElementById("employeeCargo").innerText = "";
        document.getElementById("employeeDepartamento").innerText = "";
        document.getElementById("employeeSuperior").innerText = "";
        document.getElementById("employeeEstado").innerText = "";

        // Limpiar detalles de empleados masivos
        const detallesEmpleadosMasivo = document.getElementById("detallesEmpleadosMasivo");
        detallesEmpleadosMasivo.innerHTML = '';  

        const asignarTurnoMasivoBtn = document.getElementById('asignarTurnoMasivoBtn');
        if (asignarTurnoMasivoBtn) {
            asignarTurnoMasivoBtn.style.display = 'none';
        }

        // Ocultar tarjetas de detalles
        const employeeCard = document.getElementById("employeeCard");
        const masivoCard = document.getElementById("masivoCard");

        if (employeeCard) {
            employeeCard.style.display = 'none';  
        }

        if (masivoCard) {
            masivoCard.style.display = 'none';  
        }

        const asignarTurnoBtn = document.getElementById('asignarTurnoBtn');
        if (asignarTurnoBtn) {
            asignarTurnoBtn.style.display = 'none';  
        }
    }

    // Evento para seleccionar asignación individual
    asignacionIndividualBox.addEventListener('click', function() {
        console.log("Asignación Individual seleccionada");

        limpiarDetallesEmpleado();

        asignacionIndividualBox.classList.add('selected');  // Añadir clase de selección
        asignacionMasivaBox.classList.remove('selected');  // Remover selección de masivo

        asignacionIndividualForm.style.display = 'block';  // Mostrar el formulario de asignación individual
        asignacionMasivaForm.style.display = 'none';  // Ocultar el formulario de asignación masiva
    });

    // Evento para seleccionar asignación masiva
    asignacionMasivaBox.addEventListener('click', function() {
        console.log("Asignación Masiva seleccionada");

        limpiarDetallesEmpleado();

        asignacionMasivaBox.classList.add('selected');  // Añadir clase de selección
        asignacionIndividualBox.classList.remove('selected');  // Remover selección de individual

        asignacionIndividualForm.style.display = 'none';  // Ocultar el formulario de asignación individual
        asignacionMasivaForm.style.display = 'block';  // Mostrar el formulario de asignación masiva
    });



    function aplicarClaseEstado(elemento, estado) {
        elemento.classList.remove("badge-success", "badge-danger");  
        if (estado.toUpperCase() === 'ACTIVO') {
            elemento.classList.add("badge-success");
        } else if (estado.toUpperCase() === 'INACTIVO') {
            elemento.classList.add("badge-danger");
        }
    }
    



    // Función para buscar el trabajador individualmente
    function buscarTrabajador(event) {
        event.preventDefault(); 
        const rut = document.getElementById('trabajador').value;
        
        if (rut === '' || !/^[0-9]{7,8}-[\dKk]{1}$/.test(rut)) {
            mostrarError("Por favor, ingrese un RUT válido", 'individual');
            limpiarDetallesEmpleado();
            return;
        }

        const url = `/trabajadores/buscar_trabajador/?rut=${rut}`;
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Trabajador no encontrado');
                }
                return response.json();
            })
            .then(data => {
                const detallesEmpleado = document.getElementById("detallesempleado");
                const cardEmpleado = detallesEmpleado.closest('.card');
                const asignarTurnoBtn= document.getElementById("asignarTurnoBtn");

                if (data.error) {
                    mostrarError('Trabajador no encontrado', 'individual');
                    limpiarDetallesEmpleado();
                } else {
                    cardEmpleado.style.display = "block";
                    asignarTurnoBtn.style.display="block";

                    // Obtener el estado del empleado desde los datos
                    const estadoEmpleado = data.estado.toUpperCase();

                    // Obtener el elemento HTML que contiene el estado
                    const estadoElemento = document.getElementById("employeeEstado");

                    // Aplicar la clase correcta al elemento del estado
                    aplicarClaseEstado(estadoElemento, estadoEmpleado);

                    
                    const fullName = `${(data.nombre || '').toUpperCase()} ${(data.apellido_paterno || '').toUpperCase()} ${(data.apellido_materno || '').toUpperCase()}`;
                    document.getElementById("employeeFullName").innerText = fullName.trim() || 'No disponible';

                    const fullRUT = formatearRUTConDV(data.rut, data.dv);
                    document.getElementById("employeeRUT").innerText = fullRUT.trim() || 'No disponible';

                    document.getElementById("employeeCargo").innerText = data.cargo.toUpperCase() || 'No disponible';
                    document.getElementById("employeeDepartamento").innerText = data.departamento || 'No disponible';
                    document.getElementById("employeeSuperior").innerText = `${data.superior_nombre || ''} ${data.superior_apellido || ''}`.trim() || 'No disponible';
                    document.getElementById("employeeEstado").innerText = data.estado.toUpperCase() || 'No disponible';
                }
            })
            .catch(error => {
                mostrarError(error.message);
                limpiarDetallesEmpleado();
            });
    }



    
    // Asignar eventos para búsqueda de trabajador individual
    const buscarBtn = document.getElementById('buscarTrabajadorBtn');
    const buscarForm = document.getElementById('buscarTrabajadorForm');
    if (buscarBtn && buscarForm) {
        buscarBtn.addEventListener('click', buscarTrabajador);
        buscarForm.addEventListener('submit', buscarTrabajador);
    }

    


    // ==================== ASIGNACIÓN MASIVA ============================
    const rutMasivoList = document.getElementById('rutMasivoList');
    const addRUTBtn = document.getElementById('addRUTBtn');
    let rutCounter = 0;
    addRUTBtn.removeEventListener('click', addNewRUTField); 

    // Función para agregar nuevos campos de RUT
    function addNewRUTField() {
        rutCounter++; 
        const newInputDiv = document.createElement('div');
        newInputDiv.setAttribute('class', 'input-group mb-2');
        newInputDiv.setAttribute('id', `rutField${rutCounter}`);

    
        const newInput = document.createElement('input');
        newInput.setAttribute('type', 'text');
        newInput.setAttribute('id', `rutMasivo${rutCounter}`); 
        newInput.setAttribute('name', `rutMasivo${rutCounter}`); 
        newInput.setAttribute('class', 'form-control');
        newInput.setAttribute('placeholder', 'Ej: 12345678-9');

        
        const deleteBtn = document.createElement('button');
        deleteBtn.setAttribute('type', 'button');
        deleteBtn.setAttribute('class', 'btn btn-danger btn-eliminar'); 
        deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
        
        deleteBtn.addEventListener('click', function() {
            rutMasivoList.removeChild(newInputDiv);
            rutCounter--;
        });

        // Añadir el campo de entrada y el botón al div contenedor
        newInputDiv.appendChild(newInput);
        newInputDiv.appendChild(deleteBtn);
        rutMasivoList.appendChild(newInputDiv); 
    }

    // Asegúrate de que el evento se asigne solo una vez
    if (!addRUTBtn.dataset.eventAssigned) {
        addRUTBtn.addEventListener('click', addNewRUTField);
        addRUTBtn.dataset.eventAssigned = true;
    }
    




    // Función para buscar los trabajadores masivamente
    function buscarTrabajadoresMasivo() {
        limpiarDetallesEmpleado();
        const asignarTurnoMasivoBtn = document.getElementById('asignarTurnoMasivoBtn');
    
        // Asegurarte de ocultar el botón al empezar la búsqueda
        asignarTurnoMasivoBtn.style.display = 'none';  

        let ruts = [];
        let errores = [];
        let empleadosEncontrados = false;

        
    
        // Recoger los RUTs ingresados para búsqueda
        for (let i = 0; i <= rutCounter; i++) {
            let rut = document.getElementById(`rutMasivo${i}`).value;
            if (rut !== '' && /^[0-9]{7,8}-[\dKk]{1}$/.test(rut)) {
                ruts.push(rut);
            } else {
                errores.push(`El RUT ${rut} no es válido`);
            }
        }
    
        if (errores.length > 0) {
            mostrarError(errores, 'masiva');  
            return;
        }
    
        if (ruts.length === 0) {
            mostrarError(["Por favor, ingrese al menos un RUT válido"], 'masiva');
            asignarTurnoMasivoBtn.style.display = 'none';
            return;
        }
    
        const detallesEmpleadosMasivo = document.getElementById("detallesEmpleadosMasivo");
        const masivoCard = document.getElementById("masivoCard");
    
        detallesEmpleadosMasivo.innerHTML = ''; 
        masivoCard.style.display = 'block'; 
    
        let erroresBusqueda = []; 
    
        ruts.forEach(rut => {
            const url = `/trabajadores/buscar_trabajador/?rut=${rut}`;
            fetch(url)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Error al buscar el RUT ${rut}`);
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.error) {
                        erroresBusqueda.push(`Error con el RUT ${rut}: Trabajador no encontrado`);
                        masivoCard.style.display = 'block';
                        limpiarDetallesEmpleado();
                    } else {
                        empleadosEncontrados = true;  // Marcar que se encontró al menos un empleado
                        const fullName = `${(data.nombre || '').toUpperCase()} ${(data.apellido_paterno || '').toUpperCase()} ${(data.apellido_materno || '').toUpperCase()}`.trim();
                        const fullRUT = formatearRUTConDV(data.rut, data.dv);

                        let estadoBadgeClass = 'badge-success';
                        
                        let estadoSpan = document.createElement('span');
                        estadoSpan.innerText = data.estado.toUpperCase(); 

                        aplicarClaseEstado(estadoSpan, data.estado); 
    
                        detallesEmpleadosMasivo.innerHTML += `
                            <div class="empleado">
                                <p><strong>Nombre Completo:</strong><span class="employeeFullName"> ${fullName || 'No disponible'}</p>
                                <p><strong>RUT:</strong><span class="employeeRUT"> ${fullRUT || 'No disponible'}</p>
                                <p><strong>Departamento:</strong> ${data.departamento || 'No disponible'}</p>
                                <p><strong>Estado del Empleado:</strong> <span id="employeeEstado" class="badge badge-success">${data.estado || 'No disponible'}</span></p>
                            
                               
                            </div>
                            <hr>
                        `;
                        const asignarTurnoMasivoBtn = document.getElementById('asignarTurnoMasivoBtn');
                        asignarTurnoMasivoBtn.style.display = 'block';
                    }
                })
                .catch(error => {
                    erroresBusqueda.push(`Error al procesar el RUT ${rut}: ${error.message}`);
                }) 
                .finally(() => {
                    
                    if (erroresBusqueda.length > 0) {
                        if (empleadosEncontrados) {
                            asignarTurnoMasivoBtn.style.display = 'block';  // Mostrar el botón si hay empleados válidos
                        } else {
                            asignarTurnoMasivoBtn.style.display = 'none';  // Ocultar si no hay empleados válidos
                        }
                        mostrarError(erroresBusqueda, 'masiva');  
                    }
                });
        });
    }



    // Asignar evento para búsqueda masiva
    const buscarMasivoBtn = document.getElementById('buscarMasivoBtn');
    if (buscarMasivoBtn && !buscarMasivoBtn.dataset.eventAssigned) {
        // Evento para el botón de búsqueda
        buscarMasivoBtn.addEventListener('click', buscarTrabajadoresMasivo);
        const rutMasivoList = document.getElementById('rutMasivoList');
        rutMasivoList.addEventListener('keydown', function(event) {
            if (event.target && event.target.tagName === 'INPUT' && event.key === 'Enter') {
                event.preventDefault();  // Evitar comportamiento predeterminado
                buscarTrabajadoresMasivo();  // Llamar a la función de búsqueda
            }
        });

        buscarMasivoBtn.dataset.eventAssigned = true;
    }

    // Verifica si todos los campos actuales están llenos
    function verificarCamposRUTLlenos() {
        const inputFields = document.querySelectorAll("input[id^='rutMasivo']");
        const addRUTBtn = document.getElementById("addRUTBtn");

        let todosLlenos = true;
        inputFields.forEach(input => {
            if (input.value === '') {
                todosLlenos = false;
            }
        });

        addRUTBtn.disabled = !todosLlenos;  // Deshabilitar si hay algún campo vacío
    }

    // Llama a esta función cada vez que el usuario escribe en un campo
    document.querySelectorAll("input[id^='rutMasivo']").forEach(input => {
        input.addEventListener('input', verificarCamposRUTLlenos);
    });

    // Inicialmente, ejecuta la verificación
    verificarCamposRUTLlenos();


    

    function asignarTurnoMasivo() {
        // Seleccionar todos los elementos con la clase "empleado" dentro de detallesEmpleadosMasivo
        const empleadosMasivo = document.querySelectorAll("#detallesEmpleadosMasivo .empleado");
    
        const ruts = [];
        const nombres = [];
    
        // Iterar sobre cada elemento "empleado" y extraer los detalles necesarios
        empleadosMasivo.forEach(empleado => {
            const rutElement = empleado.querySelector(".employeeRUT");
            const nombreElement = empleado.querySelector(".employeeFullName");
    
            if (rutElement && nombreElement) {
                const rut = rutElement.innerText.trim();
                const nombre = nombreElement.innerText.trim();
    
                if (rut && nombre) {
                    ruts.push(rut);
                    nombres.push(nombre);
                }
            } else {
                console.error("No se encontró el elemento para RUT o nombre en uno de los empleados");
            }
        });
    
        // Validación: si no hay empleados válidos, muestra una alerta y detén la ejecución
        if (ruts.length === 0 || nombres.length === 0) {
            Swal.fire("Error", "Por favor, ingrese al menos un RUT y nombre válidos.", "error");
            return;
        }
    
        // Construcción de la URL para redirigir a `calendario_turnos`
        const rutsParam = encodeURIComponent(ruts.join(","));
        const nombresParam = encodeURIComponent(nombres.join(","));
    
        // Redirigir a la URL con los parámetros de RUT y nombres
        window.location.href = `/calendario_turnos?rut=${rutsParam}&nombre=${nombresParam}`;
    }

    document.getElementById('asignarTurnoMasivoBtn').addEventListener('click', function() {
        asignarTurnoMasivo();
    });    

});
