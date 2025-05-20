// backend/src/middleware/authMiddleware.js
import { supabase } from '../config/supabaseClient.js'; // Asegúrate que la ruta sea correcta

export const requireAuth = async (req, res, next) => {
    // 1. Obtener el token del header de autorización
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No autorizado. Token no proporcionado o formato incorrecto.' });
    }

    const token = authHeader.split(' ')[1]; // Extraer el token de "Bearer <token>"

    if (!token) {
        return res.status(401).json({ error: 'No autorizado. Token no encontrado después de "Bearer ".' });
    }

    try {
        // 2. Verificar el token con Supabase
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error) {
            console.error('Error al verificar token con Supabase:', error.message);
            // Diferenciar errores comunes de Supabase
            if (error.message === 'JWT expired' || error.message.includes('invalid JWT')) {
                return res.status(401).json({ error: 'No autorizado. Token inválido o expirado.' });
            }
            return res.status(401).json({ error: 'No autorizado. Error al validar el token.' });
        }

        if (!user) {
            return res.status(401).json({ error: 'No autorizado. Usuario no encontrado para el token proporcionado.' });
        }

        // 3. Si el token es válido y el usuario existe, añadir el objeto 'user' al objeto 'req'
        // Esto hace que la información del usuario esté disponible en los siguientes middlewares o controladores de ruta.
        req.user = user;

        // 4. (Opcional pero recomendado) Obtener el perfil del usuario de nuestra tabla 'profiles'
        //    para tener acceso al rol y otros datos del perfil directamente en req.user.profile
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profileError) {
            console.error('Error al obtener el perfil del usuario:', profileError.message);
            // Decide si esto debe impedir el acceso o solo registrar el error
            // Por ahora, si no se encuentra el perfil pero el token es válido, podría ser un problema de datos.
            return res.status(500).json({ error: 'Error al obtener datos del perfil del usuario.' });
        }
        
        if (!profile) {
            // Esto no debería suceder si el trigger handle_new_user funciona correctamente
            return res.status(404).json({ error: 'Perfil de usuario no encontrado. Contacta al administrador.' });
        }

        // Enriquecemos req.user con la información del perfil
        req.user.profile = profile;


        // 5. Llamar a next() para pasar el control al siguiente middleware o controlador de ruta
        next();

    } catch (err) {
        console.error('Error inesperado en el middleware de autenticación:', err);
        return res.status(500).json({ error: 'Error interno del servidor durante la autenticación.' });
    }
};

// Podrías añadir el middleware checkRole aquí más adelante si lo necesitas:
// export const checkRole = (allowedRoles) => (req, res, next) => { ... }