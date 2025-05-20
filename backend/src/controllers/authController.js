// backend/src/controllers/authController.js
import { supabase } from '../config/supabaseClient.js';

export const registerUser = async (req, res) => {
    const { email, password, nombre_completo, telefono, role, cedula_profesional } = req.body;

    // Validación básica de entrada
    if (!email || !password || !nombre_completo || !role) {
        return res.status(400).json({ error: 'Email, contraseña, nombre completo y rol son requeridos.' });
    }
    // La cédula es requerida si el rol es Médico
    if (role === 'Medico' && (!cedula_profesional || cedula_profesional.trim() === '')) {
        return res.status(400).json({ error: 'La cédula profesional es requerida para médicos.' });
    }

    try {
        // 1. Registrar el usuario en Supabase Auth
        // El trigger 'handle_new_user' se encargará de crear la entrada en 'profiles'
        // usando la metadata proporcionada aquí.
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: { // Estos datos estarán disponibles en new.raw_user_meta_data en el trigger
                    role: role,
                    nombre_completo: nombre_completo,
                    telefono: telefono
                    // El trigger también debería setear 'estado_validacion' a 'Pendiente' para médicos
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
        
        // --- INICIO: LÓGICA PARA COMPLETAR REGISTRO MÉDICO ---
        // 2. Si el rol es 'Medico' y el usuario de Auth se creó correctamente,
        //    ahora creamos la entrada en la tabla 'perfiles_medicos'.
        if (role === 'Medico' && authData.user) {
            const { data: perfilMedicoData, error: perfilMedicoError } = await supabase
                .from('perfiles_medicos')
                .insert([
                    {
                        usuario_id: authData.user.id, // ID del usuario recién creado en auth.users
                        cedula_profesional: cedula_profesional
                        // 'horarios_disponibles' y 'limite_citas_diarias' usarán sus valores por defecto
                        // definidos en la tabla o serán NULL si no tienen default.
                        // Se podrán configurar más adelante por el admin o el médico.
                    }
                ])
                .select() // Opcional: para devolver el perfil médico creado
                .single(); // Esperamos insertar y seleccionar un solo registro

            if (perfilMedicoError) {
                console.error('Error al crear el registro en perfiles_medicos:', perfilMedicoError);
                // IMPORTANTE: En este punto, el usuario ya existe en `auth.users` y `profiles`.
                // Si falla la creación en `perfiles_medicos`, tienes un estado inconsistente.
                // Estrategias:
                //   a) Intentar borrar el usuario de auth.users y profiles (transacción o compensación manual).
                //   b) Dejar el usuario y marcarlo para revisión administrativa.
                //   c) Devolver un error específico indicando que el registro está incompleto.
                // Por ahora, devolvemos un error indicando la situación.
                return res.status(500).json({ 
                    error: 'Usuario de autenticación y perfil base creados, pero falló la creación de los detalles del perfil médico.',
                    details: perfilMedicoError.message 
                });
            }
            console.log('Registro en perfiles_medicos creado:', perfilMedicoData);
            
            // Si todo salió bien, el usuario y su perfil médico están listos (aunque pendiente de validación).
            // La respuesta final ya incluye el authData.user, que es suficiente para el cliente.
        }
        // --- FIN: LÓGICA PARA COMPLETAR REGISTRO MÉDICO ---

        // Respuesta exitosa del registro general
        return res.status(201).json({ 
            message: 'Usuario registrado exitosamente. Si la confirmación de email está activada, por favor verifica tu correo.', 
            user: authData.user,
            // session: authData.session // signUp no siempre devuelve session, depende de la config de Supabase (ej. auto-confirm)
        });

    } catch (error) {
        console.error('Error en el controlador de registro:', error);
        return res.status(500).json({ error: 'Error interno del servidor al registrar el usuario.' });
    }
};

export const loginUser = async (req, res) => {
    // ... (código de loginUser como lo teníamos)
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
    // ... (código de logoutUser como lo teníamos)
    return res.status(200).json({ message: 'Logout solicitado. El cliente debe eliminar el token.' });
};