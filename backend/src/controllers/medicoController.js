// backend/src/controllers/medicoController.js
import { supabase } from '../config/supabaseClient.js';

// Listar médicos aprobados para que los pacientes los vean
export const listarMedicosAprobados = async (req, res) => {
    try {
        const { data: medicos, error } = await supabase
            .from('profiles')
            .select(`
                id,
                nombre_completo,
                telefono,
                perfiles_medicos (
                    perfil_medico_id,
                    cedula_profesional,
                    horarios_disponibles,
                    limite_citas_diarias
                )
            `)
            .eq('role', 'Medico')
            .eq('estado_validacion', 'Aprobado')
            .not('perfiles_medicos', 'is', null); // Asegurar que tengan un perfil médico asociado

        if (error) {
            console.error("Error al listar médicos:", error);
            return res.status(500).json({ error: 'Error al obtener la lista de médicos.', details: error.message });
        }

        if (!medicos || medicos.length === 0) {
            return res.status(404).json({ message: 'No se encontraron médicos aprobados disponibles.' });
        }
        
        // Filtramos para asegurar que solo devolvemos médicos que tienen un perfil médico
        const medicosConPerfil = medicos.filter(m => m.perfiles_medicos && m.perfiles_medicos.length > 0)
                                       .map(m => ({ ...m, perfiles_medicos: m.perfiles_medicos[0] }));


        return res.status(200).json(medicosConPerfil);

    } catch (err) {
        console.error("Error inesperado en listarMedicosAprobados:", err);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// Médico actualiza su propia disponibilidad
export const actualizarDisponibilidadMedico = async (req, res) => {
    const medicoId = req.user.id; // Obtenido del middleware requireAuth
    const { horarios_disponibles, limite_citas_diarias } = req.body;

    if (!horarios_disponibles && typeof limite_citas_diarias === 'undefined') {
        return res.status(400).json({ error: 'Debe proporcionar horarios_disponibles o limite_citas_diarias para actualizar.' });
    }

    // Validación básica de datos (puedes expandirla)
    if (horarios_disponibles && typeof horarios_disponibles !== 'object') {
        return res.status(400).json({ error: 'horarios_disponibles debe ser un objeto JSON.' });
    }
    if (typeof limite_citas_diarias !== 'undefined' && (typeof limite_citas_diarias !== 'number' || limite_citas_diarias < 0)) {
        return res.status(400).json({ error: 'limite_citas_diarias debe ser un número no negativo.' });
    }
    
    const updates = {};
    if (horarios_disponibles) updates.horarios_disponibles = horarios_disponibles;
    if (typeof limite_citas_diarias !== 'undefined') updates.limite_citas_diarias = limite_citas_diarias;


    try {
        const { data: perfilMedico, error } = await supabase
            .from('perfiles_medicos')
            .update(updates)
            .eq('usuario_id', medicoId)
            .select()
            .single();

        if (error) {
            console.error("Error al actualizar disponibilidad del médico:", error);
            return res.status(500).json({ error: 'Error al actualizar la disponibilidad.', details: error.message });
        }

        if (!perfilMedico) {
            return res.status(404).json({ error: 'Perfil médico no encontrado para actualizar.' });
        }

        return res.status(200).json({ message: 'Disponibilidad actualizada exitosamente.', perfilMedico });

    } catch (err) {
        console.error("Error inesperado en actualizarDisponibilidadMedico:", err);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
};