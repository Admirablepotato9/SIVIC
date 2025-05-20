// backend/src/config/supabaseClient.js
import { createClient } from '@supabase/supabase-js';
// import dotenv from 'dotenv'; // Ya no es necesario importar dotenv aquí

// Ya NO necesitamos llamar a dotenv.config() aquí si app.js lo hace primero.
// dotenv.config({ path: '../../.env' }); 

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Error: Variables de entorno de Supabase no encontradas en supabaseClient.js.");
    console.error("SUPABASE_URL:", supabaseUrl);
    console.error("SUPABASE_ANON_KEY está definida:", !!supabaseAnonKey); 
    throw new Error("Supabase URL o Anon Key is missing. Esto usualmente significa que dotenv.config() no se ejecutó correctamente en tu archivo principal (app.js) antes de que este módulo fuera importado.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);