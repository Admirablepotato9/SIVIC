// backend/src/controllers/medicoController.js
import { supabase } from '../config/supabaseClient.js';

// Listar médicos aprobados para que los pacientes los vean
export const listarMedicosAprobados = async (req, res) => {
    try {
        // Seleccionamos perfiles de médicos donde el perfil de usuario asociado esté validado como 'Aprobado'
        // y también recuperamos el nombre completo del médico desde la tabla 'profiles'.
        const { data, error } = await supabase
            .from('perfiles_medicos')
            .select(`
                perfil_medico_id,
                cedula_profesional,
                horarios_disponibles,
                limite_citas_diarias,
                usuario_id,
                profiles (
                    nombre_completo,
                    email
                )
            `)
            .eq('profiles.estado_validacion', 'Aprobado'); // Filtra por estado_validacion en la tabla profiles

        if (error) throw error;

        // Mapeamos para aplanar la estructura y hacerla más amigable para el frontend
        const medicos = data.map(pm => ({
            id: pm.usuario_id, // Usamos el usuario_id como ID principal del médico
            perfil_medico_id: pm.perfil_medico_id,
            nombre_completo: pm.profiles.nombre_completo,
            email: pm.profiles.email, // Opcional, si quieres mostrarlo
            cedula_profesional: pm.cedula_profesional,
            horarios_disponibles: pm.horarios_disponibles,
            limite_citas_diarias: pm.limite_citas_diarias
        }));

        res.status(200).json(medicos);
    } catch (error) {
        console.error('Error al listar médicos:', error);
        res.status(500).json({ error: 'Error interno del servidor', details: error.message });
    }
};

// Actualizar disponibilidad del médico autenticado
export const actualizarDisponibilidadMedico = async (req, res) => {
    const medicoId = req.user.id; // Asumiendo que el middleware de autenticación añade req.user
    const { horarios_disponibles, limite_citas_diarias } = req.body;

    if (!horarios_disponibles && limite_citas_diarias === undefined) {
        return res.status(400).json({ error: 'Se requiere al menos horarios_disponibles o limite_citas_diarias.' });
    }

    const updateData = {};
    if (horarios_disponibles) updateData.horarios_disponibles = horarios_disponibles;
    if (limite_citas_diarias !== undefined) updateData.limite_citas_diarias = limite_citas_diarias;

    try {
        const { data, error } = await supabase
            .from('perfiles_medicos')
            .update(updateData)
            .eq('usuario_id', medicoId)
            .select()
            .single(); // Esperamos un solo registro actualizado

        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Perfil de médico no encontrado.' });

        res.status(200).json({ message: 'Disponibilidad actualizada con éxito', perfil: data });
    } catch (error) {
        console.error('Error al actualizar disponibilidad:', error);
        res.status(500).json({ error: 'Error interno del servidor', details: error.message });
    }
};