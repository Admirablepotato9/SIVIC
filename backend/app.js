// backend/app.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

// Importar middlewares y rutas
import { requireAuth } from './src/middleware/authMiddleware.js';
import authRoutes from './src/routes/authRoutes.js';
import profileRoutes from './src/routes/profileRoutes.js'; // <--- AÑADE ESTA LÍNEA

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

// Rutas de API
app.get('/api/test', (req, res) => {
    res.send('¡Respuesta de la API del Backend SIVIC (Pública)!');
});

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes); // <--- AÑADE ESTA LÍNEA

app.get('/api/protected-test', requireAuth, (req, res) => {
    res.json({ 
        message: '¡Has accedido a una ruta protegida!',
        user: req.user.email,
        profile: req.user.profile 
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