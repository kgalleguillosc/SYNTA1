// ==================== FULLCALENDAR ============================
document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('calendar');
    var selectedStartDate = null;
    var selectedEndDate = null;
    var today = new Date();
    var nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    const coloresTurnos = {
        A10: "#1E90FF ", A11: "#1E90FF", A13: "#1E90FF", A14: "#1E90FF", A16: "#1E90FF",
        A18: "#1E90FF", A2:  "#1E90FF", A3:  "#1E90FF", A35: "#1E90FF", A36: "#1E90FF",
        A5:  "#1E90FF", A57: "#1E90FF", A6:  "#1E90FF", A68: "#1E90FF", A7:  "#1E90FF",
        A8:  "#1E90FF", A41: "#1E90FF", B10: "#FF6347", B14: "#FF6347", P22: "#32CD32",  
        P28: "#32CD32", P07: "#32CD32", P37: "#32CD32", P38: "#32CD32", P50: "#32CD32",
        P57: "#32CD32", TE39: "#9370DB", TE51: "#9370DB", TE48: "#9370DB",F54: "#FFD700",  
        F52: "#FFD700", DES: "#808080" , A36_1: "#1E90FF", 
        TE51_1: "#9370DB"
    };

    const feriadosIrrenunciablesFijos = [
        { mes: 1, dia: 1, nombre: "Año Nuevo" },       // 1 de enero
        { mes: 5, dia: 1, nombre: "Día del Trabajo" }, // 1 de mayo
        { mes: 9, dia: 18, nombre: "Independencia de Chile" }, // 18 de septiembre
        { mes: 9, dia: 19, nombre: "Día de las Glorias del Ejército" }, // 19 de septiembre
        { mes: 12, dia: 25, nombre: "Navidad" }       // 25 de diciembre
    ];

    const feriadosNoIrrenunciables = [
        { mes: 4, dia: 18, nombre: "Viernes Santo" },                // 18 de abril
        { mes: 4, dia: 19, nombre: "Sábado Santo" },                 // 19 de abril
        { mes: 5, dia: 21, nombre: "Día de las Glorias Navales" },   // 21 de mayo
        { mes: 6, dia: 20, nombre: "Día Nacional de los Pueblos Indígenas" }, // 20 de junio
        { mes: 6, dia: 29, nombre: "San Pedro y San Pablo" },        // 29 de junio
        { mes: 7, dia: 16, nombre: "Día de la Virgen del Carmen" },  // 16 de julio
        { mes: 8, dia: 15, nombre: "Asunción de la Virgen" },        // 15 de agosto
        { mes: 10, dia: 12, nombre: "Encuentro de Dos Mundos" },     // 12 de octubre
        { mes: 10, dia: 31, nombre: "Día de las Iglesias Evangélicas y Protestantes" }, // 31 de octubre
        { mes: 11, dia: 1, nombre: "Día de Todos los Santos" },      // 1 de noviembre
        { mes: 12, dia: 8, nombre: "Inmaculada Concepción" }         // 8 de diciembre
    ];

    function generarEventosFeriados(anio) {
        return feriadosIrrenunciablesFijos.map(feriado => {
            const fecha = new Date(anio, feriado.mes - 1, feriado.dia);
            const fechaInicio = new Date(fecha);
            const fechaFin = new Date(fecha);
    
            // Establece la hora de inicio y fin del evento
            fechaInicio.setHours(9, 0, 0); // Inicio a las 09:00 AM
            fechaFin.setHours(18, 0, 0);   // Fin a las 05:00 PM
    
            return {
                title: "Irrenunciable",
                start: fechaInicio.toISOString(), // Fecha y hora de inicio
                end: fechaFin.toISOString(),     // Fecha y hora de fin
                allDay: true,                   // No es evento de todo el día
                backgroundColor: "#ffb3b3",
                borderColor: "#ff8080",
                textColor: "#000",
                bloqueado: true                  
            };
        });
    }
    

    function esFeriado(fecha) {
        const mes = fecha.getMonth() + 1;
        const dia = fecha.getDate();

        return feriadosIrrenunciablesFijos.some(feriado => feriado.mes === mes && feriado.dia === dia);
    }

    const anioActual = new Date().getFullYear();
    const eventosFeriados = [
        ...generarEventosFeriados(anioActual),
        ...generarEventosFeriados(anioActual + 1)
    ];


    if (calendarEl) {
        var calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            locale: 'es',
            firstDay: 1,
            initialDate: nextMonth,
            selectable: true,
            weekNumbers: true,
            weekNumbersWithinDays: true,
            weekNumberCalculation: 'ISO',
            headerToolbar: {
                left: 'title',
                center: '',
                right: 'prev,next today'
            },
            weekText: 'W',
            weekNumberFormat: { week: 'narrow' },
            height: 675,
            buttonText: {
                today: "Hoy",
                month: "Mes",
                week: "Semana"
            },
            titleFormat: {
                year: 'numeric', month: 'long'
            },

            // Añadir eventos de feriados al calendario
            events: eventosFeriados,

            // Configuración para evitar eliminación de feriados
            eventClick: function (info) {
                if (info.event.extendedProps.bloqueado) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Evento Bloqueado',
                        text: 'No puede ser seleccionado ni modificado.',
                        confirmButtonText: 'Entendido',
                        confirmButtonColor: '#3085d6'
                    });
                    return;
                }

                // Obtener el RUT del trabajador desde la URL
                const rut = obtenerRutDeUrl(); 

                // Verificar si el trabajador tiene la regla "no_trabaja_feriados"
                const trabajador = excepcionesTrabajadores[rut];
                if (trabajador && trabajador.reglas.includes("no_trabaja_feriados")) {
                    // Verificar si el evento corresponde a un feriado no irrenunciable
                    const feriadoSeleccionado = feriadosNoIrrenunciables.find(feriado => {
                        const fechaFeriado = new Date(new Date().getFullYear(), feriado.mes - 1, feriado.dia);
                        return fechaFeriado.toISOString().split('T')[0] === info.event.startStr;
                    });

                    if (feriadoSeleccionado) {
                        Swal.fire({
                            icon: 'warning',
                            title: 'Feriado No Irrenunciable',
                            html: `Recuerde que no se debe asignar turnos al feriado <b>${feriadoSeleccionado.nombre}</b> (${feriadoSeleccionado.dia}/${feriadoSeleccionado.mes}).`,
                            confirmButtonText: 'Entendido',
                            confirmButtonColor: '#3085d6'
                        });
                        return;
                    }
                }

                Swal.fire({
                    title: 'Evento Seleccionado',
                    text: `Has seleccionado el feriado: ${info.event.title}.`,
                    icon: 'info',
                    confirmButtonText: 'OK'
                });
        

                // Si no es un feriado bloqueado, permitir la opción de eliminar el evento
                Swal.fire({
                    title: '¿Estás seguro?',
                    text: `¿Estás seguro de que deseas eliminar el turno ${info.event.title}?`,
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Sí, eliminar',
                    cancelButtonText: 'Cancelar'
                }).then((result) => {
                    if (result.isConfirmed) {
                        eliminarTurnoVisualmente(info.event);
                        Swal.fire({
                            toast: true,
                            position: 'top-end',
                            icon: 'success',
                            title: 'Turno eliminado correctamente',
                            showConfirmButton: false,
                            timer: 3000,
                            timerProgressBar: true
                        });
                    }
                });

                
            },

            eventDidMount: function(info) {
                if (info.event.extendedProps.bloqueado) {
                    info.el.style.backgroundColor = info.event.backgroundColor;
                    info.el.style.borderColor = info.event.borderColor;
                    info.el.style.color = info.event.textColor;
                    info.el.style.fontWeight = "bold";
                } else if (coloresTurnos[info.event.title]) {
                    const colorTurno = coloresTurnos[info.event.title];
                    info.el.style.backgroundColor = colorTurno;
                    info.el.style.borderColor = colorTurno;
                    info.el.style.color = '#FFF';
                }
            },
            
            

            // Configuración de selección de fechas
            select: function(info) {
                selectedStartDate = info.startStr;
                selectedEndDate = info.endStr;

                const endDate = new Date(selectedEndDate);
                endDate.setDate(endDate.getDate() - 1);

                const adjustedEndDateStr = endDate.toISOString().split("T")[0];
                const invertirFecha = (fecha) => {
                    const [year, month, day] = fecha.split("-");
                    return `${day}-${month}-${year}`;
                };

                const formattedStartDate = invertirFecha(selectedStartDate);
                const formattedEndDate = invertirFecha(adjustedEndDateStr);

                Swal.fire({
                    title: 'Fechas seleccionadas',
                    html: `<strong>Desde:</strong> ${formattedStartDate} <br> <strong>Hasta:</strong> ${formattedEndDate}`,
                    icon: 'info',
                    confirmButtonText: 'OK'
                });

                var codigoTurno = document.getElementById('codigoTurno').value;
                var guardarBtn = document.querySelector('button[type="submit"]');
                guardarBtn.disabled = !(selectedStartDate && codigoTurno);
            },

            selectAllow: function(selectInfo) {
                let currentDate = new Date(selectInfo.start);
            
                while (currentDate < selectInfo.end) {
                    // Verificar si es domingo
                    if (currentDate.getDay() === 0) {
                        Swal.fire({
                            icon: 'warning',
                            title: 'Día no permitido',
                            text: 'No se pueden seleccionar domingos.',
                            confirmButtonText: 'Entendido',
                            confirmButtonColor: '#3085d6'
                        });
                        return false;
                    }
            
                    // Verificar si es un feriado
                    if (esFeriado(currentDate)) {
                        Swal.fire({
                            icon: 'warning',
                            title: 'Feriado Bloqueado',
                            text: 'No se puede seleccionar un feriado.',
                            confirmButtonText: 'Entendido',
                            confirmButtonColor: '#3085d6'
                        });
                        return false;
                    }
            
                    currentDate.setDate(currentDate.getDate() + 1); 
                }
            
                return true; 
            }
            
        });

        calendar.render();
    }

// ==================== UTILIDADES ============================

    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    const csrftoken = getCookie('csrftoken');



    const horasPorTurno= {
        A10: 8,   // 09:00 a 18:00
        P22: 4,   // 09:00 a 13:00
        A11: 9,   // 08:30 a 18:30
        A13: 7.5, // 09:00 a 17:00
        P28: 6.5, // 09:00 a 16:00
        A14: 8,   // 10:00 a 19:00
        A16: 6,   // 11:00 a 17:00
        A18: 5,   // 09:00 a 14:00
        A2: 9,    // 09:00 a 19:00
        TE39: 8,  // 10:00 a 19:00
        A3: 9,    // 11:00 a 21:00
        A35: 5,   // 10:00 a 15:00
        A36: 7.5, // 10:30 a 19:00
        TE51: 6.5,// 11:30 a 19:00
        A5: 10,   // 09:00 a 20:00
        A57: 7.5, // 08:00 a 16:00
        A6: 10,   // 10:00 a 21:00
        A68: 6,   // 14:00 a 21:00
        A7: 6,    // 09:00 a 15:00
        A8: 6,    // 15:00 a 21:00
        B10: 5,   // 15:30 a 21:00
        B14: 6,   // 09:30 a 15:30
        F54: 7.5, // 10:00 a 18:00
        TE48: 6.5,// 10:00 a 17:00
        P07: 7.5, // 12:30 a 21:00
        A60: 6.5, // 13:30 a 21:00
        P37: 9,   // 08:00 a 18:00
        P38: 8,   // 08:30 a 17:30
        P50: 9,   // 10:00 a 20:00
        P57: 9,   // 11:30 a 21:00
        F52: 7.5, // 11:00 a 19:30
        A41: 6.5, // 12:00 a 19:30
        DES: 0,   // DESCANSO
        A36_1: 7.5, 
        TE51_1: 6.5,
    };
    
    const excepcionesTrabajadores = {
        "15.473.361-2": {
            reglas: ["trabaja_un_sabado_mes"],
            descripcion: "Debe trabajar un sábado al mes."
        },
        "15.438.068-k": {
            reglas: ["trabaja_un_sabado_mes"],
            descripcion: "Debe trabajar un sábado al mes."
        },
        "12.237.360-6": {
            reglas: ["trabaja_un_sabado_mes"],
             descripcion: "Debe trabajar un sábado al mes."
        },
        "13.680.674-2": {
            reglas: ["trabaja_un_sabado_mes", "no_trabaja_feriados"],
            descripcion: "Debe trabajar un sábado al mes y no trabaja en días feriados (se asigna como descanso)."
        },
        "12.245.978-0": {
            reglas: ["trabaja_un_sabado_mes", "no_trabaja_feriados"],
            descripcion: "Debe trabajar un sábado al mes y no trabaja en días feriados (se asigna como descanso)."
        },
        "11.634.387-8": {
            reglas: ["trabaja_un_sabado_mes", "no_trabaja_feriados"],
            descripcion: "Debe trabajar un sábado al mes y no trabaja en días feriados (se asigna como descanso)."
        },
        "12.464.656-1": {
            reglas: ["no_trabaja_fines_semana"],
            descripcion: "No trabaja los fines de semana."
        },
        "20.668.836-K": {
            reglas: ["horario_estudio1"],
            descripcion: "Trabaja de Lunes a Viernes con horario de 9:00 a 17:00 y Sábados de 09:00 a 16:00 debido a compromisos de estudio."
        },
    };

    const HORARIOS_TURNOS = {
        "A10": { inicio: "09:00", fin: "18:00" },
        "P22": { inicio: "09:00", fin: "13:00" },
        "A11": { inicio: "08:30", fin: "18:30" },
        "A13": { inicio: "09:00", fin: "17:00" },
        "P28": { inicio: "09:00", fin: "16:00" },
        "A14": { inicio: "10:00", fin: "19:00" },
        "A16": { inicio: "11:00", fin: "17:00" },
        "A18": { inicio: "09:00", fin: "14:00" },
        "A2": { inicio: "09:00", fin: "19:00" },
        "TE39": { inicio: "10:00", fin: "19:00" },
        "A3": { inicio: "11:00", fin: "21:00" },
        "A35": { inicio: "10:00", fin: "15:00" },
        "A36": { inicio: "10:30", fin: "19:00" },
        "TE51": { inicio: "11:30", fin: "19:00" },
        "A5": { inicio: "09:00", fin: "20:00" },
        "A57": { inicio: "08:00", fin: "16:00" },
        "A6": { inicio: "10:00", fin: "21:00" },
        "A68": { inicio: "14:00", fin: "21:00" },
        "A7": { inicio: "09:00", fin: "15:00" },
        "A8": { inicio: "15:00", fin: "21:00" },
        "B10": { inicio: "15:30", fin: "21:00" },
        "B14": { inicio: "09:30", fin: "15:30" },
        "F54": { inicio: "10:00", fin: "18:00" },
        "TE48": { inicio: "10:00", fin: "17:00" },
        "P07": { inicio: "12:30", fin: "21:00" },
        "A60": { inicio: "13:30", fin: "21:00" },
        "P37": { inicio: "08:00", fin: "18:00" },
        "P38": { inicio: "08:30", fin: "17:30" },
        "P50": { inicio: "10:00", fin: "20:00" },
        "P57": { inicio: "11:30", fin: "21:00" },
        "F52": { inicio: "11:00", fin: "19:30" },
        "A41": { inicio: "12:00", fin: "19:30" },
        "DES": { inicio: null, fin: null },
        "A36_1": { inicio: "11:00", fin: "19:00" }, 
        "TE51_1": { inicio: "12:00", fin: "19:00" },
    }
    


    // ==================== VALIDACIÓN DE TURNOS ============================
    

    function obtenerNumeroDeSemana(fecha) {
        let primerDia = new Date(fecha.getFullYear(), 0, 1);
        let dias = Math.floor((fecha - primerDia) / (24 * 60 * 60 * 1000));
        
        let numeroSemana = Math.ceil((dias + primerDia.getDay() + 1) / 7);
    
        return numeroSemana;
    } 
    
    
    // function ValidarHorasPorSemana() {
    //     let horasPorSemana = {}; 
    //     let diasSumados = {};
        

    //     // Obtener los feriados para el año actual y siguiente
    //     const feriados = [
    //         ...generarEventosFeriados(new Date().getFullYear()),
    //         ...generarEventosFeriados(new Date().getFullYear() + 1)
    //     ];
    
    //     turnosTemporales.forEach((turno) => {
    //         let fechaInicio = new Date(turno.fecha);
    //         let semana = obtenerNumeroDeSemana(fechaInicio); 
    //         let anio = fechaInicio.getFullYear();

    //         if (semana === 53) {
    //             anio += 1;
    //             semana = 1;
    //         }
    
    //         let claveSemana = `${anio}-W${semana}`;
    //         let fechaStr = fechaInicio.toDateString(); 
    
    //         if (!diasSumados[fechaStr]) {
    //             let codigoTurno = turno.codigo;
    //             let horas = horasPorTurno[codigoTurno] || 0;
    
    //             if (!horasPorSemana[claveSemana]) {
    //                 horasPorSemana[claveSemana] = 0;
    //             }
    
    //             horasPorSemana[claveSemana] += horas;
    //             diasSumados[fechaStr] = true;
    //             console.log(`Semana ${claveSemana} - Acumulando ${horas} horas del turno ${codigoTurno}`);
    //         }
    //     });
    
    //     // Sumar horas de los feriados que caen en la misma semana de los turnos
    //     feriados.forEach((feriado) => {
    //         let fechaFeriado = new Date(feriado.start);

    //         // Identificar la semana del feriado
    //         let semanaFeriado = obtenerNumeroDeSemana(fechaFeriado);
    //         let anioFeriado = fechaFeriado.getFullYear();

    //         if (semanaFeriado === 53) {
    //             anioFeriado += 1;
    //             semanaFeriado = 1;
    //         }

    //         let claveSemanaFeriado = `${anioFeriado}-W${semanaFeriado}`;

    //         // Si la semana del feriado está en el objeto horasPorSemana, sumar las horas
    //         if (horasPorSemana[claveSemanaFeriado] !== undefined) {
    //             horasPorSemana[claveSemanaFeriado] += 8; // Sumar 8 horas por el feriado
    //             console.log(`Semana ${claveSemanaFeriado} - Acumulando 8 horas por feriado: ${feriado.title}`);
    //         }
    //     });

    //     console.log("Horas acumuladas por semana después del cálculo:", horasPorSemana);
    //     console.log(turnosTemporales);
    //     return horasPorSemana;
    // }
    function ValidarHorasPorSemana() {
        let horasPorSemana = {}; 
        let diasSumados = {};
        
        // Obtener los feriados para el año actual y siguiente
        const feriados = [
            ...generarEventosFeriados(new Date().getFullYear()),
            ...generarEventosFeriados(new Date().getFullYear() + 1)
        ];
    
        // Calcular horas de los turnos asignados
        turnosTemporales.forEach((turno) => {
            let fechaInicio = new Date(turno.fecha);
            let semana = obtenerNumeroDeSemana(fechaInicio); 
            let anio = fechaInicio.getFullYear();
    
            if (semana === 53) {
                anio += 1;
                semana = 1;
            }
    
            let claveSemana = `${anio}-W${semana}`;
            let fechaStr = fechaInicio.toDateString(); 
    
            if (!diasSumados[fechaStr]) {
                let codigoTurno = turno.codigo;
                let horas = horasPorTurno[codigoTurno] || 0;
    
                if (!horasPorSemana[claveSemana]) {
                    horasPorSemana[claveSemana] = 0;
                }
    
                horasPorSemana[claveSemana] += horas;
                diasSumados[fechaStr] = true;
                console.log(`Semana ${claveSemana} - Acumulando ${horas} horas del turno ${codigoTurno}`);
            }
        });
    
        // Ajustar horas de los feriados en semanas con turnos asignados
        feriados.forEach((feriado) => {
            let fechaFeriado = new Date(feriado.start);
    
            // Identificar la semana del feriado
            let semanaFeriado = obtenerNumeroDeSemana(fechaFeriado);
            let anioFeriado = fechaFeriado.getFullYear();
    
            if (semanaFeriado === 53) {
                anioFeriado += 1;
                semanaFeriado = 1;
            }
    
            let claveSemanaFeriado = `${anioFeriado}-W${semanaFeriado}`;
    
            // Calcular las horas restantes solo si la semana tiene turnos asignados
            if (horasPorSemana[claveSemanaFeriado] !== undefined) {
                let horasAsignadas = horasPorSemana[claveSemanaFeriado];
                let horasRestantes = 44 - horasAsignadas;
    
                if (horasRestantes > 0) {
                    // Asignar horas al feriado, respetando el tope de 9 horas
                    let horasFeriado = Math.min(horasRestantes, 9);
                    horasPorSemana[claveSemanaFeriado] += horasFeriado;
                    console.log(`Semana ${claveSemanaFeriado} - Ajustando feriado con ${horasFeriado} horas (máximo permitido: 9).`);
                    console.log(`Feriado (${feriado.title}) en ${fechaFeriado.toISOString().split('T')[0]} tiene ${horasFeriado} horas asignadas.`);
                } else {
                    console.log(`Semana ${claveSemanaFeriado} - No se suma horas al feriado (ya se alcanzaron las 44 horas).`);
                    console.log(`Feriado (${feriado.title}) en ${fechaFeriado.toISOString().split('T')[0]} tiene 0 horas asignadas.`);
                }
            } else {
                console.log(`Semana ${claveSemanaFeriado} - No hay turnos asignados, el feriado no se ajusta.`);
                console.log(`Feriado (${feriado.title}) en ${fechaFeriado.toISOString().split('T')[0]} tiene 0 horas asignadas.`);
            }
        });
    
        console.log("Horas acumuladas por semana después del cálculo:", horasPorSemana);
        return horasPorSemana;
    }
    

    function validarSabadosLibres() {
        let sabadosConTurnoPorMes = {}; 
        let eventos = calendar.getEvents();
        
        eventos.forEach(evento => {
            let fecha = new Date(evento.start);
            let mes = fecha.getMonth(); 
            let año = fecha.getFullYear(); 
            let claveMes = `${año}-${mes}`; 
    
            if (fecha.getDay() === 6 && horasPorTurno[evento.title] > 0) {
                if (!sabadosConTurnoPorMes[claveMes]) {
                    sabadosConTurnoPorMes[claveMes] = 0; 
                }
                sabadosConTurnoPorMes[claveMes]++; 
            }
        });

        console.log("Sábados ocupados por mes:", sabadosConTurnoPorMes);
    
        for (let claveMes in sabadosConTurnoPorMes) {
            let [año, mes] = claveMes.split('-').map(Number); 
            let totalSabadosEnMes = contarSabadosEnMes(mes, año);
            let sabadosConTurno = sabadosConTurnoPorMes[claveMes];
            let sabadosLibres = totalSabadosEnMes - sabadosConTurno;
    
            console.log(`Mes ${mes + 1}/${año}: ${sabadosConTurno} sábados con turno, ${sabadosLibres} sábados libres.`); // Depuración
            
            if (sabadosLibres < 2) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Sábados libres insuficientes',
                    html: `<br> Deben haber 2 sábados libres.`,
                    confirmButtonText: 'Entendido',
                    confirmButtonColor: '#3085d6'
                });
                return false;
            }
        }
        
        return true; 
    }
    
    function contarSabadosEnMes(mes, año) {
        let sabados = 0;
        let fecha = new Date(año, mes, 1);
        while (fecha.getDay() !== 6) {
            fecha.setDate(fecha.getDate() + 1);
        }
        
        while (fecha.getMonth() === mes) {
            sabados++; 
            fecha.setDate(fecha.getDate() + 7); 
        }
        
        return sabados;
    }

        
    
    // Obtener el primer día de la semana ISO
    function obtenerPrimerDiaDeSemana(anio, numSemana) {
        const cuartaEnero = new Date(anio, 0, 4); // El 4 de enero siempre está en la primera semana ISO
        const diaSemana = cuartaEnero.getDay() || 7; // Ajustar para que el domingo sea el día 7
        const primerLunes = new Date(cuartaEnero);
        primerLunes.setDate(cuartaEnero.getDate() - diaSemana + 1);

        return new Date(primerLunes.setDate(primerLunes.getDate() + (numSemana - 1) * 7)); // Mover al lunes de la semana deseada
    }

        
    function validarTurnosAntesDeGuardar() {
        const horasPorSemana = ValidarHorasPorSemana();
        // const cumpleSabados = validarSabadosLibres();
        const rut = obtenerRutDeUrl();
        const reglas = rut && excepcionesTrabajadores[rut] ? excepcionesTrabajadores[rut].reglas : [];
        
        const exentaValidacionSabados = reglas.includes('horario_estudio1'); // Verifica si la regla es 'horario_estudio1'

        const cumpleSabados = exentaValidacionSabados ? true : validarSabadosLibres(); // Exenta la validación si aplica la regla

    
        const resumenSemanas = document.getElementById('resumenSemanas');
        resumenSemanas.innerHTML = '';
    
        let cumpleHoras = true;
        let cumpleExcepciones = true; 
    
        for (const semana in horasPorSemana) {
            const li = document.createElement('li');
            const horasPermitidas = 44;
            const horasTrabajadas = horasPorSemana[semana];
    
            if (horasTrabajadas === horasPermitidas) {
                li.textContent = `${semana}: ✔️ Cumple con ${horasPermitidas} horas`;
                li.style.color = 'green';
            } else if (horasTrabajadas < horasPermitidas) {
                const faltanHoras = horasPermitidas - horasTrabajadas;
                li.textContent = `${semana}: ❌ Faltan ${faltanHoras} horas`;
                li.style.color = 'red';
                cumpleHoras = false;
            } else if (horasTrabajadas > horasPermitidas) {
                const excedenHoras = horasTrabajadas - horasPermitidas;
                li.textContent = `${semana}: ⚠️ Excedido por ${excedenHoras} horas`;
                li.style.color = 'orange';
                cumpleHoras = false;
            }
    
            resumenSemanas.appendChild(li);
        }
    
        const validacionSabados = document.getElementById('validacionSabados');
        if (exentaValidacionSabados) {
    
            
        } else if (cumpleSabados) {
            validacionSabados.textContent = "✔️ Se cumplen los 2 sábados libres al mes.";
            validacionSabados.style.color = 'green';
        } else {
            validacionSabados.textContent = "❌ No se cumplen los 2 sábados libres al mes.";
            validacionSabados.style.color = 'red';
        }
    
        // Validar excepciones según el RUT de la URL
        const validacionExcepciones = document.getElementById('validacionExcepciones');
        validacionExcepciones.innerHTML = ''; // Limpiar resultados previos

        if (rut && excepcionesTrabajadores[rut]) {
            const reglas = excepcionesTrabajadores[rut].reglas;

            reglas.forEach(regla => {
                const resultadoRegla = validarRegla(rut, regla);
                const li = document.createElement('li');

                if (!resultadoRegla.cumple) {
                    li.textContent = `❌ ${resultadoRegla.mensaje}`;
                    li.style.color = 'red';
                    cumpleExcepciones = false;
                } else {
                    li.textContent = `✔️ ${resultadoRegla.mensaje}`;
                    li.style.color = 'green';
                }

                validacionExcepciones.appendChild(li);
            });
        } else {
        }

        // Activar o desactivar el botón de guardar
        const guardarTurnosBtn = document.getElementById('guardarTurnosBtn');
        if (cumpleHoras && cumpleSabados && cumpleExcepciones) {
            guardarTurnosBtn.style.display = 'block';
            guardarTurnosBtn.disabled = false;
        } else {
            guardarTurnosBtn.style.display = 'none';
            guardarTurnosBtn.disabled = true;
        }
    }

    function obtenerRutDeUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        const rutEmpleado = urlParams.get('rut');
    
        if (!rutEmpleado) {
            alert('El RUT del empleado no está presente en la URL.');
            console.log('RUT no encontrado en la URL.');
            return null;
        }
    
        console.log(`RUT obtenido de la URL: ${rutEmpleado}`);
        return rutEmpleado;
    }
    
    function validarRegla(rut, regla) {
        const turnosTrabajador = turnosTemporales.filter(turno => turno.rut === rut);
    
        if (regla === 'trabaja_un_sabado_mes') {
            // Obtener los sábados con turnos por mes usando la lógica de validarSabadosLibres
            let sabadosConTurnoPorMes = {}; 
            let eventos = calendar.getEvents();
            
            eventos.forEach(evento => {
                let fecha = new Date(evento.start);
                let mes = fecha.getMonth(); 
                let año = fecha.getFullYear(); 
                let claveMes = `${año}-${mes}`; 
        
                if (fecha.getDay() === 6 && horasPorTurno[evento.title] > 0) {
                    if (!sabadosConTurnoPorMes[claveMes]) {
                        sabadosConTurnoPorMes[claveMes] = 0; 
                    }
                    sabadosConTurnoPorMes[claveMes]++; 
                }
            });
        
            console.log("Sábados con turnos por mes:", sabadosConTurnoPorMes);
        
            // Validar que haya exactamente un sábado trabajado en cada mes
            const cumple = Object.keys(sabadosConTurnoPorMes).every(mes => sabadosConTurnoPorMes[mes] === 1) &&
                           Object.keys(sabadosConTurnoPorMes).length > 0;
        
            return {
                cumple,
                mensaje: cumple
                    ? `Cumple con trabajar un solo sábado al mes.`
                    : `No cumple con trabajar un solo sábado al mes.`
            };
        }
        
        
    
        if (regla === 'no_trabaja_feriados') {
            const anioActual = new Date().getFullYear();
            const mesActual = new Date().getMonth() + 1; // Mes actual (1-12)
        
            // Obtener todos los feriados (irrenunciables y no irrenunciables)
            const todosLosFeriados = [...feriadosNoIrrenunciables, ...feriadosIrrenunciablesFijos];
        
            // Mostrar alerta solo para el mes siguiente
            const mesSiguiente = mesActual === 12 ? 1 : mesActual + 1;
            const anioFeriadosMesSiguiente = mesSiguiente === 1 ? anioActual + 1 : anioActual;
        
            const feriadosProximos = todosLosFeriados.filter(feriado => feriado.mes === mesSiguiente);
            if (feriadosProximos.length > 0 && !alertaFeriadosMostrada) {
                const listaFeriados = feriadosProximos
                    .map(feriado => `<li><b>${feriado.nombre}</b> (${feriado.dia}/${feriado.mes}/${anioFeriadosMesSiguiente})</li>`)
                    .join('');
        
                Swal.fire({
                    icon: 'info',
                    title: 'Feriados del Mes Siguiente',
                    html: `<p>El mes siguiente tiene los siguientes feriados:</p>
                           <ul>${listaFeriados}</ul>
                           <p>Recuerde que no se deben asignar turnos en estas fechas.</p>`,
                    confirmButtonText: 'Entendido',
                    confirmButtonColor: '#3085d6'
                });
        
                alertaFeriadosMostrada = true; // Marcar que la alerta ya se mostró
            }
        
            // Validar si se asigna un turno en cualquier feriado
            const turnosEnFeriados = turnosTrabajador.filter(turno => {
                const fechaTurno = new Date(`${turno.fecha}T00:00:00`); // Asegurar que la hora sea 00:00:00
                console.log(`Validando turno en la fecha: ${fechaTurno.toISOString()}`); // Log para ver cada fecha de turno
                
                // Si el turno es "DES", no mostrar alerta
                if (turno.codigo === 'DES') {
                    console.log(`Turno DES detectado en fecha: ${fechaTurno.toISOString()}, no se genera alerta.`);
                    return false; // Excluir turnos "DES" de la validación
                }

                console.log(`Validando turno en la fecha: ${fechaTurno.toISOString()}`); // Log para ver cada fecha de turno


                return todosLosFeriados.some(feriado => {
                    const fechaFeriado = new Date(fechaTurno.getFullYear(), feriado.mes - 1, feriado.dia, 0, 0, 0); // Asegurar horas en 00:00:00
                    console.log(`Comparando con feriado: ${feriado.nombre} - Fecha: ${fechaFeriado.toISOString()}`); // Log para ver cada feriado
        
                    const esFeriado = (
                        fechaTurno.getTime() === fechaFeriado.getTime() // Comparar tiempos exactos
                    );
        
                    console.log(`¿Es feriado? ${esFeriado}`); // Log para ver si la comparación detecta el feriado
                    return esFeriado;
                });
            });
        
            // Mostrar alerta si hay turnos asignados en días feriados
            turnosEnFeriados.forEach(turno => {
                const fechaTurno = new Date(`${turno.fecha}T00:00:00`);
                console.log(`Turno asignado en feriado detectado: Fecha del turno: ${fechaTurno.toISOString()}`); // Log para identificar turnos en feriados
        
                const feriado = todosLosFeriados.find(feriado => {
                    const fechaFeriado = new Date(fechaTurno.getFullYear(), feriado.mes - 1, feriado.dia, 0, 0, 0);
                    return (
                        fechaTurno.getTime() === fechaFeriado.getTime() // Comparar tiempos exactos
                    );
                });
        
                if (feriado) {
                    console.log(`Feriado detectado: ${feriado.nombre} (${feriado.dia}/${feriado.mes})`); // Log para identificar el feriado
        
                    Swal.fire({
                        icon: 'warning',
                        title: 'Turno en Feriado Detectado',
                        html: `El turno asignado para la fecha <b>${turno.fecha}</b> coincide con el feriado <b>${feriado.nombre}</b> (${feriado.dia}/${feriado.mes}).<br>Recuerde dejar este día como <b>DESCANSO (DES)</b>.`,
                        confirmButtonText: 'Entendido',
                        confirmButtonColor: '#3085d6'
                    });
                }
            });
        
            const cumple = turnosEnFeriados.length === 0;
        
            console.log(`Resultado validación feriados: ${cumple}`); // Log para ver el resultado final de la validación
        
            return {
                cumple,
                mensaje: cumple
                    ? `No tiene turnos asignados en feriados.`
                    : `Se detectaron turnos asignados en feriados. Verifique y configure como DESCANSO (DES).`
            };
        }
        
        
        
    
        
    
        if (regla === 'no_trabaja_fines_semana') {
            // Filtrar turnos asignados en fines de semana (sábado: 6, domingo: 0) que no sean "DES"
            const turnosInvalidosEnFinesDeSemana = turnosTrabajador.filter(turno => {
                const fecha = new Date(turno.fecha); // Convertir a objeto de fecha
                const diaSemana = fecha.getDay(); 
        
                console.log(`Validando día de la semana para la fecha ${turno.fecha}: ${diaSemana}`);

                return (diaSemana === 5 || diaSemana === 6) && turno.codigo !== 'DES';
            });
        
            console.log(`Turnos no válidos en fines de semana para RUT ${rut}:`, turnosInvalidosEnFinesDeSemana);
        
            // Validar si todos los turnos en fines de semana son "DES" o si no hay turnos en fines de semana
            const cumple = turnosInvalidosEnFinesDeSemana.length === 0;
        
            return {
                cumple,
                mensaje: cumple
                    ? `Cumple: Solo tiene turnos de descanso en fines de semana o no tiene turnos asignados.`
                    : `No cumple: Tiene turnos asignados en fines de semana que no son de descanso (${turnosInvalidosEnFinesDeSemana.length} turnos).`
            };
        }


        if (regla === 'horario_estudio1') {
            const turnosFueraDeHorario = turnosTrabajador.filter(turno => {
                // Validar si el turno es uno de los permitidos
                const turnosPermitidos = ["A13", "P28"];
        
                if (!turnosPermitidos.includes(turno.codigo)) {
                    console.log(`Turno no permitido encontrado: ${turno.codigo}`);
                    return true; // Turno no permitido
                }
        
                // Separar la fecha en partes para crear una fecha correcta
                const [year, month, day] = turno.fecha.split('-').map(Number);
                const fecha = new Date(year, month - 1, day); // Meses en JavaScript son 0-indexados
        
                // Ajustar el día de la semana: lunes = 0, ..., domingo = 6
                let diaSemana = fecha.getDay(); // Obtener día de la semana (0 = Domingo, ..., 6 = Sábado)
                diaSemana = (diaSemana + 6) % 7; // Ajustar: lunes = 0, ..., domingo = 6
        
                // Mapeo de nombres de días ajustado
                const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
        
                // Obtener horas de inicio y fin del diccionario HORARIOS_TURNOS
                const horarioTurno = HORARIOS_TURNOS[turno.codigo];
                const horaInicio = horarioTurno?.inicio ? parseInt(horarioTurno.inicio.split(':')[0]) : null;
                const horaFin = horarioTurno?.fin ? parseInt(horarioTurno.fin.split(':')[0]) : null;
        
                // Log para inspeccionar los datos del turno
                console.log(
                    `Validando turno ${turno.codigo} en fecha ${turno.fecha} (${diasSemana[diaSemana]} - Día: ${diaSemana})`,
                    `Horario: ${horarioTurno?.inicio || 'No definido'} a ${horarioTurno?.fin || 'No definido'}`
                );
        
                // Validar los turnos según el día de la semana
                if (diaSemana >= 0 && diaSemana <= 4) {
                    // Lunes a viernes: 9:00 a 17:00
                    return (
                        horaInicio === null || horaFin === null || horaInicio < 9 || horaFin > 17
                    );
                } else if (diaSemana === 5) {
                    // Sábados: 9:00 a 16:00
                    return (
                        horaInicio === null || horaFin === null || horaInicio < 9 || horaFin > 16
                    );
                } else {
                    // Domingo: no se permite ningún turno
                    return true;
                }
            });
        
            console.log(`Turnos fuera del horario de estudio para RUT ${rut}:`, turnosFueraDeHorario);
        
            const cumple = turnosFueraDeHorario.length === 0;
        
            return {
                cumple,
                mensaje: cumple
                    ? `Cumple: Todos los turnos están dentro de las reglas permitidas (solo A13 y P28).`
                    : `No cumple: Tiene turnos fuera de las reglas permitidas (${turnosFueraDeHorario.length} turnos no válidos).`
            };
        }
        
        
        return {
            cumple: true,
            mensaje: `La regla ${regla} no necesita validación específica.`
        };
    }


    let alertaFeriadosMostrada = false; // Indicador de alerta mostrada

    function mostrarAlertaFeriados(rut) {
        const trabajador = excepcionesTrabajadores[rut];
        if (!trabajador || !trabajador.reglas.includes('no_trabaja_feriados')) {
            return; // Salir si no aplica la regla
        }

        const mesActual = new Date().getMonth() + 1; // Mes actual (1-12)
        const mesSiguiente = mesActual === 12 ? 1 : mesActual + 1; // Mes siguiente (1-12)
        const anioActual = new Date().getFullYear();
        const anioFeriados = mesSiguiente === 1 ? anioActual + 1 : anioActual;

        // Filtrar feriados no irrenunciables del mes siguiente
        const feriadosProximos = feriadosNoIrrenunciables.filter(feriado =>
            feriado.mes === mesSiguiente
        );

        if (feriadosProximos.length > 0 && !alertaFeriadosMostrada) {
            const listaFeriados = feriadosProximos
                .map(feriado => `${feriado.nombre} (${feriado.dia}/${feriado.mes}/${anioFeriados})`)
                .join('<br>');

            Swal.fire({
                icon: 'info',
                title: 'Feriados del Mes Siguiente',
                html: `Este trabajador no puede trabajar en los siguientes feriados:<br>${listaFeriados}`,
                confirmButtonText: 'Entendido',
                confirmButtonColor: '#3085d6'
            });

            alertaFeriadosMostrada = true; // Marcar que la alerta ya se mostró
        }
    }

    // Llamar al mostrarAlertaFeriados al cargar la página
    document.addEventListener('DOMContentLoaded', function() {
        const rut = obtenerRutDeUrl(); // Obtén el RUT desde la URL
        if (rut) {
            mostrarAlertaFeriados(rut); // Muestra la alerta si aplica
        }
    });


    

    const validarTurnosBtn = document.getElementById('validarTurnosBtn');
    if (validarTurnosBtn) {
        validarTurnosBtn.addEventListener('click', function () {
            validarTurnosAntesDeGuardar();
            console.log("Validación completada.");
        });
    }

    

    

    // ==================== GUARDAR TURNOS ============================
    // Crear una lista para almacenar los turnos temporalmente en el calendario
    let turnosTemporales = [];

    // Seleccionar elementos
    var turnosForm = document.getElementById('turnosForm');
    var agregarTurnoBtn = document.getElementById('agregarTurnoBtn');
    var guardarTurnosBtn = document.getElementById('guardarTurnosBtn');



    if (turnosForm) {
        // Evento para cuando se detectan cambios en el formulario
        turnosForm.addEventListener('change', function() {
            console.log('Cambio en el formulario detectado, iniciando validaciones...');
        });

        // Evento para agregar turno en el calendario sin guardar en la base de datos
        agregarTurnoBtn.addEventListener('click', function(event) {
            event.preventDefault();
            agregarTurnoEnCalendario();
        });

        /// Evento para guardar turnos en la base de datos con confirmación
        guardarTurnosBtn.addEventListener('click', function(event) {
            event.preventDefault();

            // Confirmación antes de guardar y bloquear turnos
            Swal.fire({
                title: '¿Deseas enviar los turnos a RRHH?',
                text: 'Una vez guardados, los turnos no podrán modificarse.',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, enviar',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    // Si el usuario confirma, llama a las funciones para guardar y bloquear
                    guardarTurnos();
                    bloquearTurnos();
                        
                    Swal.fire({
                        icon: 'success',
                        title: 'Turnos enviados',
                        text: 'Turnos enviados y guardados correctamente en RRHH.',
                        showConfirmButton: false,
                        timer: 2000  // Se cierra automáticamente en 2 segundos
                    });

                    // Redirigir después de guardar
                    setTimeout(() => {
                        window.location.href = 'http://127.0.0.1:8000/dashboard/';  
                    }, 6000); 
                } else {
                    // Mensaje de SweetAlert2 cuando el usuario decide no enviar los turnos
                    Swal.fire({
                        icon: 'info',
                        title: 'Edición en curso',
                        text: 'Puedes seguir editando los turnos.',
                        timer: 2000,
                        showConfirmButton: false
                    });
                }
            });
        });
    } else {
        console.log('No se encontró el formulario con id #turnosForm');
    }



    // Función para agregar turnos en el calendario sin guardar en la base de datos
    function agregarTurnoEnCalendario() {
        if (!selectedStartDate || !selectedEndDate) {
            alert('Por favor, selecciona un rango de fechas.');
            return;
        }

        const codigoTurno = document.getElementById('codigoTurno').value;
        let currentDate = new Date(selectedStartDate);
        let endDate = new Date(selectedEndDate);
        endDate.setHours(0, 0, 0, 0);

        while (currentDate <= endDate) {
            const formattedDate = currentDate.toISOString().split('T')[0];
            
            // Añadir el turno al calendario visualmente (no se guarda en la base de datos)
            calendar.addEvent({
                title: codigoTurno,
                start: formattedDate,
                allDay: true
            });

            // Almacenar el turno temporalmente en el array turnosTemporales
            turnosTemporales.push({
                rut: rutEmpleado,
                codigo: codigoTurno,
                fecha: formattedDate
            });
            
            // Avanzar al siguiente día
            currentDate.setDate(currentDate.getDate() + 1);
        }

        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Turno agregado temporalmente',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true
        });
    }

    function obtenerDomingosDelMes(fecha) {
        // Esta función obtiene todos los domingos del mes en base a una fecha dada
        let domingos = [];
        let year = fecha.getFullYear();
        let month = fecha.getMonth();
        
        // Empezamos el primer día del mes
        let day = new Date(year, month, 1);
    
        // Buscar el primer domingo
        while (day.getDay() !== 0) {
            day.setDate(day.getDate() + 1);
        }
    
        // Agregar todos los domingos del mes
        while (day.getMonth() === month) {
            domingos.push(day.toISOString().split('T')[0]); // Convertimos a cadena de fecha simple
            day.setDate(day.getDate() + 7); // Ir al siguiente domingo
        }
    
        return domingos;
    }
    
    function agregarDomingosYFeriadosDescanso(rut) {
        // Obtener el mes de los turnos temporales
        if (turnosTemporales.length === 0) return;
    
        let fechaReferencia = new Date(turnosTemporales[0].fecha);
        let domingos = obtenerDomingosDelMes(fechaReferencia);
    
        // Obtener feriados irrenunciables del año correspondiente
        const anioTurno = fechaReferencia.getFullYear();
        const feriadosIrrenunciables = feriadosIrrenunciablesFijos.map(feriado => {
            const fecha = new Date(anioTurno, feriado.mes - 1, feriado.dia);
            return fecha.toISOString().split('T')[0];
        });
    
        // Combinar domingos y feriados irrenunciables
        const diasEspeciales = [...domingos, ...feriadosIrrenunciables];
    
        diasEspeciales.forEach(diaEspecial => {
            // Revisar si ya hay un turno en este día
            let yaAsignado = turnosTemporales.some(turno => turno.fecha === diaEspecial && turno.rut === rut);
            if (!yaAsignado) {
                // Agregar turno de descanso "DES"
                turnosTemporales.push({
                    rut: rut,
                    codigo: "DES",
                    fecha: diaEspecial,
                    estado: "Pendiente"
                });
            }
        });
    }
    
    
    
    function guardarTurnos() {
        if (turnosTemporales.length === 0) {
            alert('No hay turnos para guardar.');
            return;
        }
    
        // Obtener los RUTs únicos en los turnos temporales
        let ruts = [...new Set(turnosTemporales.map(turno => turno.rut))];
    
        // Agregar domingos de descanso para cada RUT
        ruts.forEach(rut => agregarDomingosYFeriadosDescanso(rut));
    
        // Iterar sobre cada turno en el array temporal
        turnosTemporales.forEach(turno => {
            // Dividir el RUT en caso de que haya varios juntos
            const ruts = turno.rut.split(",");  // Dividir por coma si hay varios RUTs concatenados
    
            // Enviar cada RUT individualmente
            ruts.forEach(individualRut => {
                fetch('/turnos/api/guardar_turno/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrftoken
                    },
                    body: JSON.stringify({
                        rut: individualRut.trim(), 
                        codigo: turno.codigo,
                        inicio: turno.fecha,
                        fin: turno.fecha,
                        estado: turno.estado 
                    })
                })
                .then(response => {
                    if (!response.ok) {
                        return response.json().then(errData => {
                            // Verificar si el mensaje de error indica que el turno ya está asignado
                            if (errData.message && errData.message.includes("ya tiene un turno asignado en esta fecha")) {
                                // Mostrar una alerta específica para asignación duplicada
                                Swal.fire({
                                    icon: 'warning',
                                    title: 'Turno duplicado',
                                    text: `El RUT ${individualRut.trim()} ya tiene un turno asignado en la fecha ${turno.fecha}.`,
                                    confirmButtonColor: '#3085d6'
                                });
                            } else {
                                // Para otros errores, mostrar el mensaje general
                                Swal.fire({
                                    icon: 'error',
                                    title: 'Error al guardar el turno',
                                    text: errData.message || 'Error desconocido',
                                    confirmButtonColor: '#d33'
                                });
                            }
                            throw new Error('Error en la respuesta del servidor');
                        });
                    }
                    return response.json();
                })
                .then(data => {
                    if (!data.success) {
                        alert('Error al guardar el turno: ' + (data.message || 'Error desconocido'));
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    // Esto es opcional si decides manejar todos los mensajes de error con Swal.fire
                });
            });
        });
    
        // Limpiar turnos temporales después de guardar
        turnosTemporales = [];
        Swal.fire({
            icon: 'success',
            title: 'Turnos guardados correctamente',
            showConfirmButton: false,
            timer: 2000
        });
    }
    



    function bloquearTurnos() {
        let eventos = calendar.getEvents(); // Obtener todos los eventos del calendario
        
        eventos.forEach(evento => {
            // Bloquear la edición de todos los eventos
            evento.setProp('editable', false);  // Bloquear la edición de los eventos
            evento.setProp('classNames', ['locked-event']);  // Aplicar una clase visual para indicar que están bloqueados
            evento.setExtendedProp('bloqueado', true);
        });
        
        // Deshabilitar el botón de agregar más turnos y limpiar selección
        document.getElementById('agregarTurnoBtn').disabled = true;
        document.getElementById('limpiarSeleccion').disabled = true;
    
        // Opcional: también desactivar el botón de guardar turnos, si quieres evitar futuros guardados
        document.getElementById('guardarTurnosBtn').disabled = true;
        
        Swal.fire({
            icon: 'info',
            title: 'Turnos bloqueados',
            text: 'Los turnos han sido sellados y ya no pueden modificarse.',
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#3085d6'
        });
    }
    



    // ==================== EVENTOS ============================

    // Obtener el RUT y el Nombre del empleado desde la URL
    const urlParams = new URLSearchParams(window.location.search);
    const rutEmpleado = urlParams.get('rut');
    const nombreEmpleado = urlParams.get('nombre');  // Obtener el nombre desde la URL

    // Verificar si el RUT está presente en la URL
    if (!rutEmpleado) {
        alert('El RUT del empleado no está presente en la URL.');
    }

    // Verificar si el nombre está presente en la URL
    if (!nombreEmpleado) {
        alert('El nombre del empleado no está presente en la URL.');
    }

    // Dividir nombres y RUTs por comas para mostrar cada uno en una línea separada
    const nombresArray = nombreEmpleado.split(',');
    const rutsArray = rutEmpleado.split(',');

    // Crear el HTML para mostrar cada nombre y RUT en una lista
    const nombresHTML = nombresArray.map(nombre => `<li>${nombre.trim()}</li>`).join('');
    const rutsHTML = rutsArray.map(rut => `<li>${rut.trim()}</li>`).join('');

    // Insertar el HTML generado en los elementos correspondientes
    document.getElementById('nombreEjecutivo').innerHTML = `<ul>${nombresHTML}</ul>`;
    document.getElementById('rutTrabajador').innerHTML = `<ul>${rutsHTML}</ul>`;


    function eliminarTurnoVisualmente(evento) {
        
        evento.remove();
    
        // Remover el turno del array `turnosTemporales` basado en la fecha
        turnosTemporales = turnosTemporales.filter(turno => turno.fecha !== evento.startStr);
        
        // Verificar que el turno fue eliminado
        console.log("turnosTemporales después de eliminación:", turnosTemporales);
        
        // Recalcular las horas y actualizar la validación
        validarTurnosAntesDeGuardar();
    }
    


    // Evento para eliminar todos los turnos del calendario sin afectarlo en el servidor
    document.getElementById('limpiarSeleccion').addEventListener('click', function() {
        // Obtener todos los eventos del calendario
        var eventos = calendar.getEvents();

        if (eventos.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Sin turnos seleccionados',
                text: 'No hay turnos seleccionados para eliminar.',
                confirmButtonText: 'Entendido',
                confirmButtonColor: '#3085d6'
            });
            return;
        }

        // Confirmar si el usuario quiere eliminar todos los turnos
        Swal.fire({
            title: '¿Estás seguro de que deseas eliminar todos los turnos?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                eventos.forEach(evento => {
                    if (!evento.extendedProps.bloqueado) { // Si el evento no está bloqueado
                        evento.remove();
                    }
                });
    
                // Limpiar la lista de turnos temporales también
                turnosTemporales = [];
    
                // Ejecutar la función de validación después de limpiar
                validarTurnosAntesDeGuardar();

                Swal.fire({
                    icon: 'success',
                    title: 'Todos los turnos eliminados correctamente',
                    showConfirmButton: false,
                    timer: 2000
                });
                // Limpiar cualquier validación después de eliminar todos los turnos
                limpiarValidaciones();
            }
        });
    });
        

    // Función para limpiar los datos de las validaciones
    function limpiarValidaciones() {
        let resumenSemanas = document.getElementById('resumenSemanas');
        let validacionHoras = document.getElementById('validacionHoras');
        let validacionSabados = document.getElementById('validacionSabados');
        let guardarTurnosBtn = document.getElementById('guardarTurnosBtn');

        resumenSemanas.innerHTML = ''; // Limpiar el resumen de semanas
        validacionHoras.textContent = ''; // Limpiar la validación de horas
        validacionSabados.textContent = ''; // Limpiar la validación de sábados
        guardarTurnosBtn.style.display = 'none'; // Ocultar el botón de guardar
        guardarTurnosBtn.disabled = true; // Deshabilitar el botón de guardar
    }
    
    


    
});
