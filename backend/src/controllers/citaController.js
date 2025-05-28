// backend/src/controllers/citaController.js
import { supabase } from '../config/supabaseClient.js';

function getDayOfWeek(dateString) {
    const date = new Date(dateString);
    const dayIndex = date.getDay(); 
    const days = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    return days[dayIndex];
}

function isTimeWithinRange(timeToCheckStr, rangeStr) {
    if (!timeToCheckStr || !rangeStr || !rangeStr.includes('-')) {
        console.warn("isTimeWithinRange: Entrada inválida", { timeToCheckStr, rangeStr });
        return false;
    }
    const [startTimeStr, endTimeStr] = rangeStr.split('-');
    if (!startTimeStr || !endTimeStr) {
        console.warn("isTimeWithinRange: Rango de tiempo mal formado", { rangeStr });
        return false;
    }
    
    try {
        const timeToCheck = new Date(`1970-01-01T${timeToCheckStr}:00Z`);
        const startTime = new Date(`1970-01-01T${startTimeStr}:00Z`);
        const endTime = new Date(`1970-01-01T${endTimeStr}:00Z`);

        return timeToCheck >= startTime && timeToCheck < endTime;
    } catch (e) {
        console.error("isTimeWithinRange: Error al parsear fechas/horas", { timeToCheckStr, startTimeStr, endTimeStr, error: e });
        return false;
    }
}

export const agendarCita = async (req, res) => {
    const pacienteId = req.user.id; 
    const { medico_id, fecha_hora_cita } = req.body; 

    console.log("AGENDAR_CITA: Solicitud recibida de paciente", pacienteId, "para médico", medico_id, "en", fecha_hora_cita);

    if (!medico_id || !fecha_hora_cita) {
        return res.status(400).json({ error: 'ID del médico y fecha/hora de la cita son requeridos.' });
    }

    try {
        const requestedDateTime = new Date(fecha_hora_cita);
        if (isNaN(requestedDateTime.getTime())) {
            return res.status(400).json({ error: 'Formato de fecha_hora_cita inválido.' });
        }
        if (requestedDateTime <= new Date()) {
            return res.status(400).json({ error: 'No se pueden agendar citas en el pasado.' });
        }

        console.log("AGENDAR_CITA: Obteniendo perfil del médico seleccionado:", medico_id);
        const { data: medicoProfileData, error: medicoError } = await supabase
            .from('profiles')
            .select(`
                id,
                estado_validacion,
                role,
                perfiles_medicos (
                    horarios_disponibles,
                    limite_citas_diarias
                )
            `)
            .eq('id', medico_id) 
            .eq('role', 'Medico') 
            .maybeSingle(); 

        if (medicoError) {
            console.error("AGENDAR_CITA: Error al obtener perfil del médico seleccionado:", medicoError);
            return res.status(500).json({ error: 'Error al verificar la información del médico.', details: medicoError.message });
        }

        console.log("AGENDAR_CITA: Datos del médico seleccionado:", JSON.stringify(medicoProfileData, null, 2));

        if (!medicoProfileData) {
            return res.status(404).json({ error: 'Médico seleccionado no encontrado en el sistema.' });
        }
        if (medicoProfileData.estado_validacion !== 'Aprobado') {
            return res.status(403).json({ error: 'El médico seleccionado no está aprobado actualmente para recibir citas.' });
        }
        
        if (!medicoProfileData.perfiles_medicos) { 
            console.error("AGENDAR_CITA: El médico seleccionado no tiene un registro de perfil médico detallado (perfiles_medicos es null). ID Médico:", medico_id);
            return res.status(404).json({ error: 'El médico seleccionado no tiene detalles de perfil configurados (sin datos en perfiles_medicos).' });
        }
        
        const disponibilidadMedico = medicoProfileData.perfiles_medicos; 

        if (!disponibilidadMedico.horarios_disponibles || typeof disponibilidadMedico.horarios_disponibles !== 'object') {
            console.error("AGENDAR_CITA: El médico seleccionado no tiene 'horarios_disponibles' válidos en su perfil médico. ID Médico:", medico_id, "Disponibilidad:", disponibilidadMedico);
            return res.status(400).json({ error: 'El médico seleccionado no ha configurado sus horarios de disponibilidad correctamente.' });
        }

        const horariosSemanales = disponibilidadMedico.horarios_disponibles; // Ya es un objeto
        const limiteCitasDiarias = disponibilidadMedico.limite_citas_diarias;

        if (typeof limiteCitasDiarias !== 'number' || limiteCitasDiarias < 0) {
            console.error("AGENDAR_CITA: Límite de citas diarias inválido para el médico:", medico_id, "Límite:", limiteCitasDiarias);
            return res.status(500).json({ error: 'Configuración de límite de citas del médico incorrecta.' });
        }


        const requestedDateOnly = fecha_hora_cita.split('T')[0];
        const requestedTimeOnly = fecha_hora_cita.split('T')[1]?.substring(0, 5); 

        if(!requestedTimeOnly) {
            return res.status(400).json({ error: 'Formato de hora en fecha_hora_cita inválido.' });
        }

        const dayOfWeek = getDayOfWeek(requestedDateOnly);

        const horariosDelDia = horariosSemanales[dayOfWeek];
        if (!horariosDelDia || !Array.isArray(horariosDelDia) || horariosDelDia.length === 0) {
            return res.status(400).json({ error: `El médico no tiene horarios configurados para los ${dayOfWeek}.` });
        }

        let isTimeSlotAvailable = false;
        for (const range of horariosDelDia) {
            if (isTimeWithinRange(requestedTimeOnly, range)) {
                isTimeSlotAvailable = true;
                break;
            }
        }

        if (!isTimeSlotAvailable) {
            return res.status(400).json({ error: `El horario ${requestedTimeOnly} no está dentro de los rangos de atención del médico para los ${dayOfWeek}. Rangos disponibles: ${horariosDelDia.join(', ')}` });
        }

        const { count: countCitaExistenteMismaHora, error: checkMismaHoraError } = await supabase
            .from('citas')
            .select('cita_id', { count: 'exact', head: true })
            .eq('medico_id', medico_id)
            .eq('fecha_hora_cita', fecha_hora_cita)
            .neq('estado_cita', 'Cancelada_Paciente')
            .neq('estado_cita', 'Cancelada_Medico')
            .neq('estado_cita', 'Completada');

        if (checkMismaHoraError) {
            console.error("AGENDAR_CITA: Error verificando cita existente en misma hora:", checkMismaHoraError);
            return res.status(500).json({ error: 'Error al verificar disponibilidad horaria.', details: checkMismaHoraError.message });
        }

        if (countCitaExistenteMismaHora > 0) {
            return res.status(409).json({ error: 'El médico ya tiene una cita programada en esta fecha y hora exactas.' });
        }

        const startOfDay = `${requestedDateOnly}T00:00:00.000Z`;
        const endOfDay = `${requestedDateOnly}T23:59:59.999Z`;

        const { count: countCitasDelDia, error: countError } = await supabase
            .from('citas')
            .select('cita_id', { count: 'exact', head: true })
            .eq('medico_id', medico_id)
            .gte('fecha_hora_cita', startOfDay)
            .lte('fecha_hora_cita', endOfDay)
            .neq('estado_cita', 'Cancelada_Paciente')
            .neq('estado_cita', 'Cancelada_Medico')
            .neq('estado_cita', 'Completada');

        if (countError) {
            console.error("AGENDAR_CITA: Error contando citas del día:", countError);
            return res.status(500).json({ error: 'Error al verificar límite de citas.', details: countError.message });
        }
        
        if (countCitasDelDia >= limiteCitasDiarias) {
            return res.status(409).json({ error: `El médico ha alcanzado el límite de ${limiteCitasDiarias} citas para el día ${new Date(requestedDateOnly + 'T00:00:00').toLocaleDateString('es-ES', {year: 'numeric', month: 'long', day: 'numeric'})}.` });
        }

        const { data: nuevaCita, error: insertError } = await supabase
            .from('citas')
            .insert({
                paciente_id: pacienteId,
                medico_id: medico_id,
                fecha_hora_cita: fecha_hora_cita,
                estado_cita: 'Programada'
            })
            .select()
            .single();

        if (insertError) {
            console.error("AGENDAR_CITA: Error al insertar la nueva cita:", insertError);
            return res.status(500).json({ error: 'Error al agendar la cita.', details: insertError.message });
        }

        console.log("AGENDAR_CITA: Cita agendada exitosamente:", nuevaCita);
        return res.status(201).json({ message: 'Cita agendada exitosamente.', cita: nuevaCita });

    } catch (err) {
        console.error("AGENDAR_CITA: Error inesperado:", err);
        if (err instanceof TypeError && err.message.includes("horarios_disponibles")) {
             console.error("AGENDAR_CITA: TypeError específico relacionado con horarios_disponibles. Datos del médico podrían ser incompletos.");
             return res.status(500).json({ error: 'Error interno al procesar la disponibilidad del médico. Por favor, intente más tarde o contacte al soporte.' });
        }
        if (err instanceof SyntaxError && err.message.includes("JSON")) {
             return res.status(400).json({ error: 'Formato de JSON inválido en la solicitud.' });
        }
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

export const listarCitasPaciente = async (req, res) => {
    const pacienteId = req.user.id;
    try {
        const { data: citas, error } = await supabase
            .from('citas')
            .select(`
                cita_id,
                fecha_hora_cita,
                estado_cita,
                notas_diagnostico,
                medico:profiles!citas_medico_id_fkey (id, nombre_completo),
                paciente:profiles!citas_paciente_id_fkey (id, nombre_completo)
            `)
            .eq('paciente_id', pacienteId)
            .order('fecha_hora_cita', { ascending: true });

        if (error) {
            console.error("Error al listar citas del paciente:", error);
            return res.status(500).json({ error: 'Error al obtener las citas.', details: error.message });
        }
        return res.status(200).json(citas);
    } catch (err) {
        console.error("Error inesperado en listarCitasPaciente:", err);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

export const listarCitasMedico = async (req, res) => {
    const medicoId = req.user.id;
    try {
        const { data: citas, error } = await supabase
            .from('citas')
            .select(`
                cita_id,
                fecha_hora_cita,
                estado_cita,
                notas_diagnostico,
                paciente:profiles!citas_paciente_id_fkey (id, nombre_completo, telefono),
                medico:profiles!citas_medico_id_fkey (id, nombre_completo)
            `)
            .eq('medico_id', medicoId)
            .order('fecha_hora_cita', { ascending: true });

        if (error) {
            console.error("Error al listar citas del médico:", error);
            return res.status(500).json({ error: 'Error al obtener las citas.', details: error.message });
        }
        return res.status(200).json(citas);
    } catch (err) {
        console.error("Error inesperado en listarCitasMedico:", err);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

export const actualizarEstadoCita = async (req, res) => {
    const medicoId = req.user.id;
    const { citaId } = req.params;
    const { estado_cita, notas_diagnostico } = req.body;

    if (!estado_cita) {
        return res.status(400).json({ error: 'El nuevo estado_cita es requerido.' });
    }
    
    const estadosValidos = ['Confirmada', 'Completada', 'Cancelada_Medico'];
    if (!estadosValidos.includes(estado_cita)) {
        return res.status(400).json({ error: 'Estado de cita no válido.' });
    }
    
    try {
        const { data: citaExistente, error: checkError } = await supabase
            .from('citas')
            .select('medico_id, estado_cita') // Traer estado_cita para verificar si ya está 'Completada' etc.
            .eq('cita_id', citaId)
            .single();

        if (checkError || !citaExistente) {
            return res.status(404).json({ error: 'Cita no encontrada.' });
        }
        if (citaExistente.medico_id !== medicoId) {
            return res.status(403).json({ error: 'No autorizado para modificar esta cita.' });
        }
        if (['Completada', 'Cancelada_Paciente', 'Cancelada_Medico'].includes(citaExistente.estado_cita)) {
            return res.status(400).json({ error: `La cita ya está ${citaExistente.estado_cita} y no se puede modificar su estado.` });
        }
        if (estado_cita === 'Confirmada' && citaExistente.estado_cita === 'Confirmada') {
            return res.status(400).json({ error: 'La cita ya está confirmada.'});
        }


        const updates = { estado_cita };
        if (estado_cita === 'Completada') {
            updates.notas_diagnostico = notas_diagnostico !== undefined ? notas_diagnostico : null;
        } else {
            // Si el nuevo estado NO es 'Completada', nos aseguramos de no enviar notas_diagnostico
            // para no sobrescribir notas existentes si no es la intención.
            // Opcionalmente, podrías decidir limpiar las notas si se cambia de 'Completada' a otro estado.
            // updates.notas_diagnostico = null; // Descomentar si quieres limpiar notas al cambiar de 'Completada'
        }


        const { data: citaActualizada, error: updateError } = await supabase
            .from('citas')
            .update(updates)
            .eq('cita_id', citaId)
            .select()
            .single();
        
        if (updateError) {
            console.error("Error al actualizar estado de la cita:", updateError);
            return res.status(500).json({ error: 'Error al actualizar la cita.', details: updateError.message });
        }

        return res.status(200).json({ message: 'Estado de la cita actualizado.', cita: citaActualizada });

    } catch (err) {
        console.error("Error inesperado en actualizarEstadoCita:", err);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

export const cancelarCitaPaciente = async (req, res) => {
    const pacienteId = req.user.id;
    const { citaId } = req.params;

    try {
        const { data: citaExistente, error: checkError } = await supabase
            .from('citas')
            .select('paciente_id, estado_cita, fecha_hora_cita')
            .eq('cita_id', citaId)
            .single();

        if (checkError || !citaExistente) {
            return res.status(404).json({ error: 'Cita no encontrada.' });
        }
        if (citaExistente.paciente_id !== pacienteId) {
            return res.status(403).json({ error: 'No autorizado para cancelar esta cita.' });
        }
        if (['Completada', 'Cancelada_Paciente', 'Cancelada_Medico'].includes(citaExistente.estado_cita)) {
            return res.status(400).json({ error: 'Esta cita ya no puede ser cancelada.' });
        }

        const ahora = new Date();
        const fechaCitaObj = new Date(citaExistente.fecha_hora_cita);
        const diffHoras = (fechaCitaObj.getTime() - ahora.getTime()) / (1000 * 60 * 60);

        if (diffHoras < 2) { 
            return res.status(400).json({ error: 'No puedes cancelar citas con menos de 2 horas de antelación.' });
        }

        const { data: citaCancelada, error: updateError } = await supabase
            .from('citas')
            .update({ estado_cita: 'Cancelada_Paciente' })
            .eq('cita_id', citaId)
            .select()
            .single();
        
        if (updateError) {
            console.error("Error al cancelar la cita por el paciente:", updateError);
            return res.status(500).json({ error: 'Error al cancelar la cita.', details: updateError.message });
        }
        return res.status(200).json({ message: 'Cita cancelada exitosamente.', cita: citaCancelada });
    } catch (err) {
        console.error("Error inesperado en cancelarCitaPaciente:", err);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
};