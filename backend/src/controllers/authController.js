// backend/src/controllers/authController.js
import { supabase } from '../config/supabaseClient.js';

export const registerUser = async (req, res) => {
    const { email, password, nombre_completo, telefono, role, cedula_profesional } = req.body;

    if (!email || !password || !nombre_completo || !role) {
        return res.status(400).json({ error: 'Email, contraseña, nombre completo y rol son requeridos.' });
    }
    if (role === 'Medico' && (!cedula_profesional || cedula_profesional.trim() === '')) {
        return res.status(400).json({ error: 'La cédula profesional es requerida para médicos.' });
    }

    try {
        const signUpOptions = {
            data: { 
                role: role,
                nombre_completo: nombre_completo,
                // El teléfono es opcional, así que si es undefined/null, Supabase lo manejará
                ...(telefono && telefono.trim() !== '' && { telefono: telefono.trim() })
            }
        };

        if (role === 'Medico') {
            signUpOptions.data.cedula_profesional = cedula_profesional;
        }

        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: signUpOptions
        });

        if (authError) {
            console.error('Error en Supabase Auth signUp:', authError);
            return res.status(400).json({ error: authError.message });
        }
        if (!authData.user && !authData.session) { // Revisar si hay usuario o sesión (para usuarios ya confirmados)
             console.error('Respuesta de signUp no contiene usuario ni sesión:', authData);
             return res.status(500).json({ error: 'No se pudo crear el usuario en Supabase Auth, pero no hubo error explícito de API. Respuesta inesperada.' });
        }
        
        // La inserción en 'profiles' y 'perfiles_medicos' (si es médico)
        // ahora es manejada completamente por el trigger 'handle_new_user' en la base de datos.
        // No se necesita lógica de inserción aquí para esas tablas.

        // Si necesitas devolver el perfil inmediatamente después del registro (lo cual es bueno),
        // podrías hacer un fetch aquí, pero el trigger ya lo creó.
        // El usuario deberá hacer login para obtener su perfil completo a través del authMiddleware.

        return res.status(201).json({ 
            message: 'Usuario registrado exitosamente. Si la confirmación de email está activada, por favor verifica tu correo.', 
            user: authData.user, // authData.user puede ser null si la confirmación de email está habilitada y el usuario aún no ha confirmado
            session: authData.session // session será null hasta que el usuario confirme y haga login
        });

    } catch (error) {
        console.error('Error en el controlador de registro:', error);
        return res.status(500).json({ error: 'Error interno del servidor al registrar el usuario.' });
    }
};

export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email y contraseña son requeridos.' });
    }

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            console.error('Error en Supabase Auth signIn:', error);
            return res.status(401).json({ error: error.message });
        }

        // El perfil completo (incluyendo datos de 'profiles' y 'perfiles_medicos')
        // se obtendrá en el frontend a través del endpoint /api/profile/me,
        // el cual utiliza el authMiddleware para adjuntar estos datos.

        return res.status(200).json({ 
            message: 'Login exitoso.', 
            user: data.user, 
            session: data.session 
        });

    } catch (error) {
        console.error('Error en el controlador de login:', error);
        return res.status(500).json({ error: 'Error interno del servidor al iniciar sesión.' });
    }
};

export const logoutUser = async (req, res) => {
    // El cliente es responsable de eliminar el token.
    // Supabase.auth.signOut() es para el cliente.
    // Si se quisiera invalidar el token en el servidor, se requeriría la service_role key
    // y llamar a supabase.auth.admin.signOut(jwt) o similar, pero no es el flujo típico para logout de cliente.
    return res.status(200).json({ message: 'Logout solicitado. El cliente debe eliminar el token.' });
};