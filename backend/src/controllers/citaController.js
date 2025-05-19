// backend/src/controllers/citaController.js
import { supabase } from '../config/supabaseClient.js';

// Agendar una nueva cita (Paciente)
export const agendarCita = async (req, res) => {
    const pacienteId = req.user.id; // Asumiendo req.user del middleware de autenticación
    const { medico_id, fecha_hora_cita } = req.body;

    if (!medico_id || !fecha_hora_cita) {
        return res.status(400).json({ error: 'Faltan campos requeridos: medico_id, fecha_hora_cita.' });
    }

    try {
        // TODO: Lógica de validación de disponibilidad del médico (horario y límite_citas_diarias)
        // 1. Obtener perfil del médico (horarios_disponibles, limite_citas_diarias)
        const { data: perfilMedico, error: perfilError } = await supabase
            .from('perfiles_medicos')
            .select('horarios_disponibles, limite_citas_diarias')
            .eq('usuario_id', medico_id)
            .single();

        if (perfilError || !perfilMedico) {
            return res.status(404).json({ error: 'Médico no encontrado o perfil no configurado.' });
        }

        // 2. Contar citas existentes para ese médico en esa fecha
        const fechaCita = new Date(fecha_hora_cita).toISOString().split('T')[0]; // Solo la fecha YYYY-MM-DD
        const { count: citasExistentes, error: countError } = await supabase
            .from('citas')
            .select('*', { count: 'exact', head: true })
            .eq('medico_id', medico_id)
            .gte('fecha_hora_cita', `${fechaCita}T00:00:00.000Z`)
            .lte('fecha_hora_cita', `${fechaCita}T23:59:59.999Z`);
        
        if (countError) throw countError;

        if (citasExistentes >= perfilMedico.limite_citas_diarias) {
            return res.status(409).json({ error: 'El médico ha alcanzado el límite de citas para este día.' });
        }

        // TODO: Validación más detallada de si el horario específico está ocupado
        // y si cae dentro de los horarios_disponibles del médico.
        // Esto puede ser complejo y depende de cómo almacenes `horarios_disponibles`.

        const { data: nuevaCita, error: citaError } = await supabase
            .from('citas')
            .insert([{ paciente_id: pacienteId, medico_id, fecha_hora_cita, estado_cita: 'Programada' }])
            .select()
            .single();

        if (citaError) throw citaError;

        res.status(201).json({ message: 'Cita agendada con éxito', cita: nuevaCita });
    } catch (error) {
        console.error('Error al agendar cita:', error);
        res.status(500).json({ error: 'Error interno del servidor', details: error.message });
    }
};

// Listar citas del paciente autenticado
export const listarCitasPaciente = async (req, res) => {
    const pacienteId = req.user.id;
    try {
        const { data, error } = await supabase
            .from('citas')
            .select(`
                *,
                medico: profiles!citas_medico_id_fkey (nombre_completo)
            `)
            .eq('paciente_id', pacienteId)
            .order('fecha_hora_cita', { ascending: true });

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        console.error('Error al listar citas del paciente:', error);
        res.status(500).json({ error: 'Error interno del servidor', details: error.message });
    }
};

// Listar citas del médico autenticado
export const listarCitasMedico = async (req, res) => {
    const medicoId = req.user.id;
    try {
        const { data, error } = await supabase
            .from('citas')
            .select(`
                *,
                paciente: profiles!citas_paciente_id_fkey (nombre_completo, telefono)
            `)
            .eq('medico_id', medicoId)
            .order('fecha_hora_cita', { ascending: true });
        
        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        console.error('Error al listar citas del médico:', error);
        res.status(500).json({ error: 'Error interno del servidor', details: error.message });
    }
};

// Actualizar estado de una cita (Médico)
export const actualizarEstadoCita = async (req, res) => {
    const medicoId = req.user.id;
    const { citaId } = req.params;
    const { estado_cita, notas_diagnostico } = req.body;

    if (!estado_cita) {
        return res.status(400).json({ error: 'El campo estado_cita es requerido.' });
    }
    // Validar que el estado sea uno de los permitidos (opcional, pero buena práctica)

    const updateData = { estado_cita };
    if (estado_cita === 'Completada' && notas_diagnostico !== undefined) {
        updateData.notas_diagnostico = notas_diagnostico;
    } else if (estado_cita === 'Completada' && notas_diagnostico === undefined) {
        // Si se completa pero no se envían notas, se podrían limpiar notas previas o mantenerlas.
        // Por ahora, solo actualizamos si se envían.
    }


    try {
        const { data, error } = await supabase
            .from('citas')
            .update(updateData)
            .eq('cita_id', citaId)
            .eq('medico_id', medicoId) // Asegurar que el médico solo actualice sus citas
            .select()
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Cita no encontrada o no pertenece a este médico.' });

        res.status(200).json({ message: 'Estado de la cita actualizado', cita: data });
    } catch (error) {
        console.error('Error al actualizar estado de cita:', error);
        res.status(500).json({ error: 'Error interno del servidor', details: error.message });
    }
};

// Cancelar cita por el paciente
export const cancelarCitaPaciente = async (req, res) => {
    const pacienteId = req.user.id;
    const { citaId } = req.params;

    try {
        // Podrías añadir lógica para verificar si la cita aún puede ser cancelada (ej. no menos de 24h antes)
        const { data, error } = await supabase
            .from('citas')
            .update({ estado_cita: 'Cancelada_Paciente' })
            .eq('cita_id', citaId)
            .eq('paciente_id', pacienteId) // Asegurar que el paciente solo cancele sus citas
            .in('estado_cita', ['Programada', 'Confirmada']) // Solo cancelar si está en estos estados
            .select()
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Cita no encontrada, ya fue cancelada/completada o no pertenece a este paciente.' });

        res.status(200).json({ message: 'Cita cancelada con éxito', cita: data });
    } catch (error) {
        console.error('Error al cancelar cita por paciente:', error);
        res.status(500).json({ error: 'Error interno del servidor', details: error.message });
    }
};