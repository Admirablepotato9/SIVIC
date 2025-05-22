// backend/src/controllers/profileController.js
import { supabase } from '../config/supabaseClient.js';

export const getMyProfile = async (req, res) => {
    if (!req.user || !req.user.profile) {
        return res.status(404).json({ error: 'Perfil de usuario no encontrado o no autenticado.' });
    }
    // Incluimos el email de auth.users por conveniencia, ya que profiles.email no existe
    const profileWithEmail = {
        ...req.user.profile,
        email: req.user.email 
    };
    return res.status(200).json(profileWithEmail);
};

export const updateMyProfile = async (req, res) => {
    if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'Usuario no autenticado.' });
    }

    const userId = req.user.id;
    const { nombre_completo, telefono } = req.body;

    if (!nombre_completo && !telefono) {
        return res.status(400).json({ error: 'Debes proporcionar al menos un campo para actualizar (nombre_completo o telefono).' });
    }

    const updates = {};
    if (nombre_completo !== undefined) updates.nombre_completo = nombre_completo; // Permitir string vacío si se desea limpiar
    if (telefono !== undefined) updates.telefono = telefono;

    try {
        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', userId)
            .select()
            .single();

        if (error) {
            console.error('Error al actualizar el perfil:', error);
            return res.status(500).json({ error: 'Error al actualizar el perfil del usuario.', details: error.message });
        }

        if (!data) {
            return res.status(404).json({ error: 'Perfil no encontrado para actualizar.' });
        }
        
        // Añadimos el email de auth.users a la respuesta del perfil actualizado
        const updatedProfileWithEmail = {
            ...data,
            email: req.user.email
        };

        return res.status(200).json({ message: 'Perfil actualizado exitosamente.', profile: updatedProfileWithEmail });

    } catch (err) {
        console.error('Error inesperado al actualizar perfil:', err);
        return res.status(500).json({ error: 'Error interno del servidor al actualizar el perfil.' });
    }
};