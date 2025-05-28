// backend/app.js
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import { requireAuth } from './src/middleware/authMiddleware.js';
import authRoutes from './src/routes/authRoutes.js';
import profileRoutes from './src/routes/profileRoutes.js';
import medicoRoutes from './src/routes/medicoRoutes.js'; // CLAVE
import citaRoutes from './src/routes/citaRoutes.js';     

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

app.get('/api/test', (req, res) => {
    res.send('¡Respuesta de la API del Backend SIVIC (Pública)!');
});

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/medicos', medicoRoutes); // USO DE MEDICO ROUTES
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