// backend/app.js
import dotenv from 'dotenv';
dotenv.config(); // Carga variables de .env para desarrollo local

import express from 'express';
import cors from 'cors';
// 'path' y 'fileURLToPath' no son estrictamente necesarios si ya no sirves estáticos desde aquí
// import path from 'path'; 
// import { fileURLToPath } from 'url';

// Importación de tus módulos de rutas
import { requireAuth } from './src/middleware/authMiddleware.js';
import authRoutes from './src/routes/authRoutes.js';
import profileRoutes from './src/routes/profileRoutes.js';
import medicoRoutes from './src/routes/medicoRoutes.js';
import citaRoutes from './src/routes/citaRoutes.js';     

// const __filename = fileURLToPath(import.meta.url); // No necesario si no usas __dirname
// const __dirname = path.dirname(__filename);       // No necesario si no usas __dirname

const app = express();
const PORT = process.env.PORT || 3001; // Render inyectará process.env.PORT

// Configuración de CORS más específica
// Reemplaza 'https://TU_USUARIO_GITHUB.github.io' con la URL base de tu GitHub Pages
// o configúralo como una variable de entorno en Render (ej. FRONTEND_URL)
const frontendGitHubPagesURL = process.env.FRONTEND_URL || 'https://TU_USUARIO_GITHUB.github.io'; 
const allowedOrigins = [
    'http://localhost:3001',    // Para desarrollo local si el frontend corre en otro puerto que no sea el del backend
    'http://127.0.0.1:5500',    // Común para Live Server de VSCode
    frontendGitHubPagesURL      // URL de tu frontend en GitHub Pages
];

console.log("CORS Allowed Origins:", allowedOrigins);

app.use(cors({
    origin: function (origin, callback) {
        // Permitir peticiones sin 'origin' (como Postman, apps móviles, o si el navegador no lo envía por alguna razón)
        // Y permitir si el origin está en nuestra lista blanca
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.warn(`CORS: Origin ${origin} no permitido.`);
            callback(new Error('No permitido por CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Asegúrate de permitir los métodos que usas
    allowedHeaders: ['Content-Type', 'Authorization']   // Y los headers que necesitas
}));

app.use(express.json()); // Middleware para parsear JSON bodies
app.use(express.urlencoded({ extended: true })); // Middleware para parsear URL-encoded bodies

// Rutas de la API
app.get('/api/test', (req, res) => {
    res.send('¡Respuesta de la API del Backend SIVIC (Pública)!');
});

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/medicos', medicoRoutes); 
app.use('/api/citas', citaRoutes);     

app.get('/api/protected-test', requireAuth, (req, res) => {
    if (!req.user || !req.user.profile) { 
        return res.status(404).json({ message: 'Perfil de usuario no disponible en ruta protegida.' });
    }
    res.json({ 
        message: '¡Has accedido a una ruta protegida!',
        user_auth_email: req.user.email,
        user_profile: req.user.profile 
    });
});

// Ya no necesitas servir el frontend/index.html desde aquí si usas GitHub Pages para el frontend.
// La siguiente ruta que servía el frontend para cualquier ruta no-API puede ser eliminada o comentada:
/*
const frontendPath = path.join(__dirname, '../frontend'); // __dirname no está definido si quitaste las importaciones de path
app.use(express.static(frontendPath));

app.get(/^\/(?!api)./, (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'), (err) => {
        if (err) {
            console.error("Error al enviar index.html:", err);
            res.status(err.status || 500).send("Error al cargar la página principal.");
        }
    });
});
*/

// Middleware para manejar errores 404 de rutas API no encontradas (opcional pero bueno)
app.use('/api/*', (req, res) => {
    res.status(404).json({ error: `Ruta API no encontrada: ${req.method} ${req.originalUrl}` });
});

app.listen(PORT, () => {
    console.log(`Servidor SIVIC corriendo en el puerto ${PORT}`);
    if (process.env.NODE_ENV !== 'production') {
        console.log(`Acceso local (si aplica): http://localhost:${PORT}`);
    }
});