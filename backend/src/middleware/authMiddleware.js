// backend/src/middleware/authMiddleware.js
import { supabase } from '../config/supabaseClient.js';

export const requireAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No autorizado. Token no proporcionado o formato incorrecto.' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No autorizado. Token no encontrado después de "Bearer ".' });
    }

    try {
        const { data: { user }, error: authUserError } = await supabase.auth.getUser(token);

        if (authUserError) {
            console.error('Error al verificar token con Supabase (auth.getUser):', authUserError.message);
            if (authUserError.message === 'JWT expired' || authUserError.message.includes('invalid JWT')) {
                return res.status(401).json({ error: 'No autorizado. Token inválido o expirado.' });
            }
            return res.status(401).json({ error: 'No autorizado. Error al validar el token.' });
        }

        if (!user) {
            return res.status(401).json({ error: 'No autorizado. Usuario no encontrado para el token proporcionado.' });
        }
        
        // Guardamos el usuario de Supabase Auth (que incluye el email)
        req.user = user; 

        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profileError) {
            console.error('Error al obtener el perfil del usuario desde la tabla profiles:', profileError.message);
            return res.status(500).json({ error: 'Error al obtener datos del perfil del usuario.' });
        }
        
        if (!profile) {
            return res.status(404).json({ error: 'Perfil de usuario no encontrado en la tabla profiles. Contacta al administrador.' });
        }

        // Añadimos el perfil de la tabla 'profiles' a req.user
        req.user.profile = profile;

        next();

    } catch (err) {
        console.error('Error inesperado en el middleware de autenticación:', err);
        return res.status(500).json({ error: 'Error interno del servidor durante la autenticación.' });
    }
};