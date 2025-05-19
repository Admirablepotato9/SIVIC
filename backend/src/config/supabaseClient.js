// backend/src/config/supabaseClient.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Asegúrate que la ruta al .env sea correcta desde la raíz del proyecto backend
// Si .env está en la raíz de 'backend/', entonces dotenv.config() sin path es suficiente si app.js lo carga primero.
// O puedes especificar la ruta como:
// dotenv.config({ path: './.env' }); // Si se ejecuta desde la raíz de 'backend'
// O si este archivo se llama desde una subcarpeta y el .env está dos niveles arriba:
dotenv.config({ path: '../../.env' }); // Ajusta esta ruta si es necesario

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Error: Variables de entorno de Supabase no encontradas.");
    console.error("SUPABASE_URL:", supabaseUrl);
    console.error("SUPABASE_ANON_KEY:", !!supabaseAnonKey); // Solo para ver si está definida o no
    throw new Error("Supabase URL o Anon Key is missing. Check your .env file and its path in supabaseClient.js.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);