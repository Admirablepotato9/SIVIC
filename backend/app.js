// backend/app.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Importar Rutas (Asegúrate que las rutas a estos archivos sean correctas)
// Las rutas de autenticación y perfil se añadirán/completarán en la Iteración 1,
// pero podemos referenciarlas aquí si ya tienes los archivos placeholder.
// import authRoutes from './src/routes/authRoutes.js';
// import profileRoutes from './src/routes/profileRoutes.js';
import medicoRoutes from './src/routes/medicoRoutes.js';
import citaRoutes from './src/routes/citaRoutes.js';
// Las rutas de administración, expediente y prescripciones se añadirán en iteraciones futuras.
// import adminRoutes from './src/routes/adminRoutes.js';
// import expedienteRoutes from './src/routes/expedienteRoutes.js';
// import prescripcionRoutes from './src/routes/prescripcionRoutes.js';


// Configuración para obtener __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carga variables del .env ubicado en la raíz de la carpeta 'backend'
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors()); // Habilita CORS para todas las rutas, considera configuraciones más restrictivas para producción
app.use(express.json()); // Para parsear JSON en el body de las peticiones
app.use(express.urlencoded({ extended: true })); // Para parsear datos de formularios x-www-form-urlencoded

// --- SERVIR ARCHIVOS ESTÁTICOS DEL FRONTEND ---
// Asumiendo que tu carpeta frontend se llama 'sivic-app' (o 'frontend') y está al mismo nivel que 'backend'
const frontendPath = path.join(__dirname, '../sivic-app'); // Ajusta 'sivic-app' si tu carpeta se llama diferente
app.use(express.static(frontendPath));
// ----------------------------------------------


// --- RUTAS DE API ---
// Ruta de prueba de la API (para verificar que el backend funciona)
app.get('/api/test', (req, res) => {
    res.send('¡Respuesta de la API del Backend SIVIC!');
});

// Rutas de Autenticación y Perfiles (se completarán en Iteración 1)
// app.use('/api/auth', authRoutes);
// app.use('/api/profile', profileRoutes); // O '/api/profiles' según prefieras

// Rutas para Médicos (Iteración 2)
app.use('/api/medicos', medicoRoutes);

// Rutas para Citas (Iteración 2)
app.use('/api/citas', citaRoutes);

// Rutas de Administración (Iteración 3)
// app.use('/api/admin', adminRoutes);

// Rutas de Expediente (Iteración 3)
// app.use('/api/expediente', expedienteRoutes);

// Rutas de Prescripciones (Iteración 4)
// app.use('/api/prescripciones', prescripcionRoutes);

// --------------------------------------------------------------------


// --- MANEJAR RUTAS DEL FRONTEND (Catch-all para SPA o servir index.html) ---
// Esta ruta debe ir DESPUÉS de todas tus rutas de API y del middleware de archivos estáticos.
// Captura cualquier ruta GET que no haya sido manejada por la API o por express.static
// y sirve el index.html principal. Esto es útil para Single Page Applications.
app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'), (err) => {
        if (err) {
            console.error("Error al intentar enviar index.html como fallback:", err);
            // Si el archivo no se encuentra o hay otro error, puedes enviar un 404
            // o un error genérico, pero asegúrate de no exponer detalles sensibles.
            if (!res.headersSent) { // Solo envía respuesta si no se ha enviado ya
                 res.status(404).send("Recurso no encontrado o error al cargar la página.");
            }
        }
    });
});
// --------------------------------------------------------------------


// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor SIVIC corriendo en http://localhost:${PORT}`);
    console.log(`Frontend (si se sirve desde aquí) debería estar disponible en http://localhost:${PORT}`);
});