// backend/src/config/supabaseClient.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path'; // Necesitarás path para construir la ruta al .env
import { fileURLToPath } from 'url'; // Para obtener __dirname

// Obtener la ruta del directorio actual de este archivo (supabaseClient.js)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Construir la ruta al archivo .env que está dos niveles arriba
// desde src/config/ hasta backend/
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Error: Variables de entorno de Supabase no encontradas en supabaseClient.js.");
    console.error("SUPABASE_URL:", supabaseUrl);
    console.error("SUPABASE_ANON_KEY está definida:", !!supabaseAnonKey);
    console.error("Se intentó cargar .env desde:", envPath); // Log para depurar la ruta
    throw new Error("Supabase URL o Anon Key is missing. Revisa la ruta al .env en supabaseClient.js y el contenido del .env.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);