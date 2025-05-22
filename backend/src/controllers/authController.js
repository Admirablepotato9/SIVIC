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
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: { 
                    role: role,
                    nombre_completo: nombre_completo,
                    telefono: telefono
                }
            }
        });

        if (authError) {
            console.error('Error en Supabase Auth signUp:', authError);
            return res.status(400).json({ error: authError.message });
        }
        if (!authData.user) {
             return res.status(500).json({ error: 'No se pudo crear el usuario en Supabase Auth, pero no hubo error explícito.' });
        }
        
        if (role === 'Medico' && authData.user) {
            const { data: perfilMedicoData, error: perfilMedicoError } = await supabase
                .from('perfiles_medicos')
                .insert([
                    {
                        usuario_id: authData.user.id,
                        cedula_profesional: cedula_profesional
                    }
                ])
                .select()
                .single();

            if (perfilMedicoError) {
                console.error('Error al crear el registro en perfiles_medicos:', perfilMedicoError);
                return res.status(500).json({ 
                    error: 'Usuario de autenticación y perfil base creados, pero falló la creación de los detalles del perfil médico.',
                    details: perfilMedicoError.message 
                });
            }
            console.log('Registro en perfiles_medicos creado:', perfilMedicoData);
        }

        return res.status(201).json({ 
            message: 'Usuario registrado exitosamente. Si la confirmación de email está activada, por favor verifica tu correo.', 
            user: authData.user,
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
    // Esta ruta es más para conformidad o si Supabase tuviera alguna lógica de servidor para signOut.
    // const token = req.headers.authorization?.split(' ')[1];
    // if (token) {
    //    await supabase.auth.signOut(token); // Si quieres intentar invalidar en Supabase
    // }
    return res.status(200).json({ message: 'Logout solicitado. El cliente debe eliminar el token.' });
};