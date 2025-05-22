// backend/app.js
import dotenv from 'dotenv';
dotenv.config(); // Cargar variables de entorno PRIMERO

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Importar rutas
import authRoutes from './src/routes/authRoutes.js';
import profileRoutes from './src/routes/profileRoutes.js';
import { requireAuth } from './src/middleware/authMiddleware.js'; // Para la ruta protegida de prueba

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const frontendPath = path.join(__dirname, '../frontend'); // Ajusta si tu carpeta se llama sivic-app
app.use(express.static(frontendPath));

// Rutas de API
app.get('/api/test', (req, res) => {
    res.send('¡Respuesta de la API del Backend SIVIC (Pública)!');
});

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);

// Ruta protegida de ejemplo (puedes mantenerla para probar el middleware)
app.get('/api/protected-test', requireAuth, (req, res) => {
    res.json({ 
        message: '¡Has accedido a una ruta protegida!',
        user_auth_email: req.user.email, // Email del usuario de Supabase Auth
        user_profile: req.user.profile // Perfil completo de tu tabla 'profiles'
    });
});

// Manejar rutas del frontend (SPA)
app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'), (err) => {
        if (err) {
            console.error("Error al enviar index.html:", err);
            res.status(err.status || 500).send("Error al cargar la página principal.");
        }
    });
});

app.listen(PORT, () => {
    console.log(`Servidor SIVIC corriendo en http://localhost:${PORT}`);
    console.log(`Frontend debería estar disponible en http://localhost:${PORT}`);
});