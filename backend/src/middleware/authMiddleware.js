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
            console.error('AUTH_MIDDLEWARE: Error al verificar token con Supabase (auth.getUser):', authUserError.message, 'Status:', authUserError.status);
            if (authUserError.message === 'JWT expired' || authUserError.message.includes('invalid JWT') || authUserError.status === 401) {
                return res.status(401).json({ error: 'No autorizado. Token inválido o expirado.' });
            }
            return res.status(401).json({ error: 'No autorizado. Error al validar el token.' });
        }

        if (!user) {
            console.log('AUTH_MIDDLEWARE: Usuario no encontrado para el token proporcionado.');
            return res.status(401).json({ error: 'No autorizado. Usuario no encontrado para el token proporcionado.' });
        }
        
        console.log('AUTH_MIDDLEWARE: Usuario de Auth verificado:', JSON.stringify(user, null, 2));
        req.user = user; 

        const { data: profileDataFromDB, error: profileError } = await supabase
            .from('profiles')
            .select(`
                id,
                role,
                nombre_completo,
                telefono,
                is_active,
                estado_validacion,
                created_at,
                perfiles_medicos (
                    perfil_medico_id,
                    cedula_profesional,
                    horarios_disponibles,
                    limite_citas_diarias
                )
            `)
            .eq('id', user.id)
            .single(); 

        if (profileError) {
            console.error('AUTH_MIDDLEWARE: Error al obtener el perfil del usuario desde la tabla profiles:', profileError.message);
            return res.status(500).json({ error: 'Error al obtener datos del perfil del usuario.', details: profileError.message });
        }
        
        console.log('AUTH_MIDDLEWARE: profileDataFromDB obtenido de Supabase:', JSON.stringify(profileDataFromDB, null, 2));

        if (!profileDataFromDB) {
            console.error(`AUTH_MIDDLEWARE: Perfil NO encontrado en la tabla 'profiles' para el usuario ID: ${user.id}. El trigger handle_new_user podría no estar funcionando correctamente o el perfil fue eliminado.`);
            req.user.profile = null; 
        } else {
            req.user.profile = profileDataFromDB;
        }
        
        console.log('AUTH_MIDDLEWARE: req.user.profile establecido como:', JSON.stringify(req.user.profile, null, 2));
        next();

    } catch (err) {
        console.error('AUTH_MIDDLEWARE: Error inesperado:', err);
        return res.status(500).json({ error: 'Error interno del servidor durante la autenticación.' });
    }
};