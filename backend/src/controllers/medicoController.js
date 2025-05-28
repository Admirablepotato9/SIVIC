// backend/src/controllers/medicoController.js
import { supabase } from '../config/supabaseClient.js';

export const listarMedicosAprobados = async (req, res) => {
    console.log("LISTAR_MEDICOS_APROBADOS: Solicitud recibida.");
    try {
        const { data: medicosData, error } = await supabase
            .from('profiles')
            .select(`
                id,
                nombre_completo,
                telefono,
                estado_validacion, 
                role,
                perfiles_medicos (
                    perfil_medico_id,
                    cedula_profesional,
                    horarios_disponibles,
                    limite_citas_diarias
                )
            `)
            .eq('role', 'Medico')
            .eq('estado_validacion', 'Aprobado');

        if (error) {
            console.error("LISTAR_MEDICOS_APROBADOS: Error al obtener la lista de médicos:", error);
            return res.status(500).json({ error: 'Error al obtener la lista de médicos.', details: error.message });
        }

        console.log("LISTAR_MEDICOS_APROBADOS: Datos crudos de Supabase:", JSON.stringify(medicosData, null, 2));

        if (!medicosData || medicosData.length === 0) {
            console.log("LISTAR_MEDICOS_APROBADOS: No se encontraron perfiles con rol 'Medico' y estado 'Aprobado'.");
            return res.status(404).json({ message: 'No se encontraron médicos aprobados disponibles en el sistema.' });
        }
        
        // --- CORRECCIÓN EN EL FILTRO ---
        const medicosConPerfilValido = medicosData
            .filter(m => 
                m.perfiles_medicos && // Asegurarse que el objeto perfiles_medicos exista
                typeof m.perfiles_medicos.horarios_disponibles === 'object' && // Y que horarios_disponibles sea un objeto
                Object.keys(m.perfiles_medicos.horarios_disponibles).length > 0 // Y que tenga al menos un día configurado
            ) 
            .map(m => ({ 
                id: m.id,
                nombre_completo: m.nombre_completo,
                telefono: m.telefono,
                // Como perfiles_medicos ya es un objeto, lo pasamos directamente
                perfiles_medicos: m.perfiles_medicos 
            }));

        console.log("LISTAR_MEDICOS_APROBADOS: Médicos filtrados con perfil válido:", JSON.stringify(medicosConPerfilValido, null, 2));

        if (medicosConPerfilValido.length === 0) {
            console.log("LISTAR_MEDICOS_APROBADOS: Ningún médico aprobado tiene un perfil médico completo con horarios configurados.");
             return res.status(404).json({ message: 'Actualmente no hay médicos con horarios de disponibilidad configurados.' });
        }

        return res.status(200).json(medicosConPerfilValido);

    } catch (err) {
        console.error("LISTAR_MEDICOS_APROBADOS: Error inesperado:", err);
        return res.status(500).json({ error: 'Error interno del servidor al listar médicos.' });
    }
};

export const actualizarDisponibilidadMedico = async (req, res) => {
    console.log("ACTUALIZAR_DISPONIBILIDAD: Solicitud recibida.");
    if (!req.user || !req.user.id) {
        return res.status(401).json({ error: "Usuario no autenticado." });
    }
    const medicoId = req.user.id;
    const { horarios_disponibles, limite_citas_diarias } = req.body;

    if (horarios_disponibles === undefined && limite_citas_diarias === undefined) {
        return res.status(400).json({ error: 'Debe proporcionar horarios_disponibles o limite_citas_diarias para actualizar.' });
    }

    if (horarios_disponibles !== undefined && typeof horarios_disponibles !== 'object') {
        return res.status(400).json({ error: 'horarios_disponibles debe ser un objeto JSON.' });
    }
    if (limite_citas_diarias !== undefined && (typeof limite_citas_diarias !== 'number' || limite_citas_diarias < 0)) {
        return res.status(400).json({ error: 'limite_citas_diarias debe ser un número no negativo.' });
    }
    
    const updates = {};
    if (horarios_disponibles !== undefined) updates.horarios_disponibles = horarios_disponibles;
    if (limite_citas_diarias !== undefined) updates.limite_citas_diarias = limite_citas_diarias;

    console.log("ACTUALIZAR_DISPONIBILIDAD: Payload de actualización:", JSON.stringify(updates));

    try {
        const { data: perfilMedico, error } = await supabase
            .from('perfiles_medicos')
            .update(updates)
            .eq('usuario_id', medicoId) 
            .select()
            .single(); 

        if (error) {
            console.error("ACTUALIZAR_DISPONIBILIDAD: Error al actualizar disponibilidad del médico:", error);
            if (error.code === 'PGRST116') { 
                 console.error("ACTUALIZAR_DISPONIBILIDAD: No se encontró un registro en perfiles_medicos para el usuario_id:", medicoId);
                 return res.status(404).json({ error: 'Perfil médico detallado no encontrado para este usuario. Es posible que el registro inicial no se haya completado.', details: error.message });
            }
            return res.status(500).json({ error: 'Error al actualizar la disponibilidad.', details: error.message });
        }

        if (!perfilMedico) { 
            console.error("ACTUALIZAR_DISPONIBILIDAD: Perfil médico no encontrado después de update para usuario_id:", medicoId);
            return res.status(404).json({ error: 'Perfil médico no encontrado para actualizar después del intento.' });
        }

        console.log("ACTUALIZAR_DISPONIBILIDAD: Disponibilidad actualizada exitosamente:", JSON.stringify(perfilMedico, null, 2));
        return res.status(200).json({ message: 'Disponibilidad actualizada exitosamente.', perfilMedico });

    } catch (err) {
        console.error("ACTUALIZAR_DISPONIBILIDAD: Error inesperado:", err);
        return res.status(500).json({ error: 'Error interno del servidor al actualizar disponibilidad.' });
    }
};