// backend/src/controllers/profileController.js
import { supabase } from '../config/supabaseClient.js';

// Obtener el perfil del usuario autenticado
export const getMyProfile = async (req, res) => {
    // El middleware requireAuth ya ha verificado el token
    // y ha añadido req.user (con datos de auth.users) y req.user.profile (con datos de tu tabla profiles)
    
    if (!req.user || !req.user.profile) {
        // Esto no debería ocurrir si requireAuth funciona correctamente
        return res.status(404).json({ error: 'Perfil de usuario no encontrado o no autenticado.' });
    }

    // Simplemente devolvemos la información del perfil que ya obtuvimos en el middleware
    return res.status(200).json(req.user.profile);
};

// Actualizar el perfil del usuario autenticado
export const updateMyProfile = async (req, res) => {
    if (!req.user || !req.user.id) {
        // Esto no debería ocurrir si requireAuth funciona correctamente
        return res.status(401).json({ error: 'Usuario no autenticado.' });
    }

    const userId = req.user.id; // ID del usuario de auth.users (y profiles.id)
    const { nombre_completo, telefono } = req.body; // Campos que permitimos actualizar

    // Validación básica de los datos a actualizar
    if (!nombre_completo && !telefono) {
        return res.status(400).json({ error: 'Debes proporcionar al menos un campo para actualizar (nombre_completo o telefono).' });
    }

    const updates = {};
    if (nombre_completo) updates.nombre_completo = nombre_completo;
    if (telefono) updates.telefono = telefono;
    // No permitimos actualizar 'role', 'email' (se maneja en auth), 'estado_validacion' (admin), 'is_active' (admin) directamente aquí.

    try {
        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', userId)
            .select() // Para devolver el perfil actualizado
            .single(); // Esperamos actualizar un solo registro

        if (error) {
            console.error('Error al actualizar el perfil:', error);
            return res.status(500).json({ error: 'Error al actualizar el perfil del usuario.', details: error.message });
        }

        if (!data) {
            // Esto podría suceder si el ID no coincide, aunque requireAuth debería haberlo asegurado
            return res.status(404).json({ error: 'Perfil no encontrado para actualizar.' });
        }

        return res.status(200).json({ message: 'Perfil actualizado exitosamente.', profile: data });

    } catch (err) {
        console.error('Error inesperado al actualizar perfil:', err);
        return res.status(500).json({ error: 'Error interno del servidor al actualizar el perfil.' });
    }
};