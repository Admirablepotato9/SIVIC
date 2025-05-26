// backend/src/controllers/citaController.js
import { supabase } from '../config/supabaseClient.js';

// Paciente agenda una nueva cita
export const agendarCita = async (req, res) => {
    const pacienteId = req.user.id; // Obtenido de requireAuth
    const { medico_id, fecha_hora_cita, especialidad_solicitada } = req.body; // especialidad_solicitada es opcional

    if (!medico_id || !fecha_hora_cita) {
        return res.status(400).json({ error: 'ID del médico y fecha/hora de la cita son requeridos.' });
    }

    // TODO: Lógica de validación de disponibilidad del médico
    // 1. Obtener perfil del médico: horarios_disponibles, limite_citas_diarias
    // 2. Verificar que fecha_hora_cita esté dentro de un slot de horarios_disponibles.
    // 3. Verificar que el médico no haya alcanzado su limite_citas_diarias para esa fecha.
    // Esta lógica puede ser compleja y la simularemos por ahora.
    // En una implementación real, esta validación es CRUCIAL.

    console.warn("ADVERTENCIA: La validación de disponibilidad del médico aún no está implementada en agendarCita.");

    try {
        const { data: nuevaCita, error } = await supabase
            .from('citas')
            .insert({
                paciente_id: pacienteId,
                medico_id: medico_id,
                fecha_hora_cita: fecha_hora_cita,
                // especialidad_solicitada: especialidad_solicitada, // Si lo incluyes en la tabla
                estado_cita: 'Programada' // Estado inicial
            })
            .select()
            .single();

        if (error) {
            console.error("Error al agendar la cita:", error);
            return res.status(500).json({ error: 'Error al agendar la cita.', details: error.message });
        }

        return res.status(201).json({ message: 'Cita agendada exitosamente.', cita: nuevaCita });

    } catch (err) {
        console.error("Error inesperado en agendarCita:", err);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// Listar citas del paciente autenticado
export const listarCitasPaciente = async (req, res) => {
    const pacienteId = req.user.id;
    try {
        const { data: citas, error } = await supabase
            .from('citas')
            .select(`
                *,
                medico:profiles!citas_medico_id_fkey (nombre_completo, id),
                paciente:profiles!citas_paciente_id_fkey (nombre_completo, id)
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

// Listar citas del médico autenticado
export const listarCitasMedico = async (req, res) => {
    const medicoId = req.user.id;
    try {
        const { data: citas, error } = await supabase
            .from('citas')
            .select(`
                *,
                paciente:profiles!citas_paciente_id_fkey (nombre_completo, id, telefono),
                medico:profiles!citas_medico_id_fkey (nombre_completo, id)
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

// Médico actualiza el estado de una cita (y añade notas si se completa)
export const actualizarEstadoCita = async (req, res) => {
    const medicoId = req.user.id;
    const { citaId } = req.params; // El ID de la cita vendrá en la URL
    const { estado_cita, notas_diagnostico } = req.body;

    if (!estado_cita) {
        return res.status(400).json({ error: 'El nuevo estado_cita es requerido.' });
    }
    // Validación de estados permitidos
    const estadosValidos = ['Confirmada', 'Completada', 'Cancelada_Medico'];
    if (!estadosValidos.includes(estado_cita)) {
        return res.status(400).json({ error: 'Estado de cita no válido.' });
    }
    if (estado_cita === 'Completada' && typeof notas_diagnostico === 'undefined') {
        // Podrías hacerlo opcional, pero si se completa, usualmente hay notas.
        // return res.status(400).json({ error: 'notas_diagnostico son requeridas si la cita se marca como Completada.' });
    }

    try {
        // Primero, verificar que la cita pertenezca al médico
        const { data: citaExistente, error: checkError } = await supabase
            .from('citas')
            .select('medico_id')
            .eq('cita_id', citaId)
            .single();

        if (checkError || !citaExistente) {
            return res.status(404).json({ error: 'Cita no encontrada.' });
        }
        if (citaExistente.medico_id !== medicoId) {
            return res.status(403).json({ error: 'No autorizado para modificar esta cita.' });
        }

        // Actualizar la cita
        const updates = { estado_cita };
        if (estado_cita === 'Completada' && notas_diagnostico) {
            updates.notas_diagnostico = notas_diagnostico;
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

// Paciente cancela su propia cita
export const cancelarCitaPaciente = async (req, res) => {
    const pacienteId = req.user.id;
    const { citaId } = req.params;

    try {
        // Verificar que la cita pertenezca al paciente y esté en un estado cancelable
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
        if (citaExistente.estado_cita === 'Completada' || citaExistente.estado_cita.startsWith('Cancelada')) {
            return res.status(400).json({ error: 'Esta cita ya no puede ser cancelada.' });
        }
        // Opcional: Lógica para no cancelar con poca antelación
        // const ahora = new Date();
        // const fechaCita = new Date(citaExistente.fecha_hora_cita);
        // if (fechaCita.getTime() - ahora.getTime() < (24 * 60 * 60 * 1000)) { // Menos de 24h
        //     return res.status(400).json({ error: 'No puedes cancelar citas con menos de 24 horas de antelación.' });
        // }


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