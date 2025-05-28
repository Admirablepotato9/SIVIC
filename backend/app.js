// backend/app.js
import dotenv from 'dotenv';
dotenv.config(); 

import express from 'express';
import cors from 'cors';
// No necesitas 'path' ni 'fileURLToPath' si solo sirves la API

import { requireAuth } from './src/middleware/authMiddleware.js';
import authRoutes from './src/routes/authRoutes.js';
import profileRoutes from './src/routes/profileRoutes.js';
import medicoRoutes from './src/routes/medicoRoutes.js';
import citaRoutes from './src/routes/citaRoutes.js';     

const app = express();
const PORT = process.env.PORT || 3001;

// --- Configuración de CORS ---
// Obtén la URL del frontend de una variable de entorno si está definida,
// sino, usa un valor por defecto (que DEBES CAMBIAR si es diferente a tu GitHub Pages URL)
const frontendAppUrl = process.env.FRONTEND_URL || 'https://admirablepotato9.github.io'; 

const allowedOrigins = [
    frontendAppUrl, // URL de producción de tu frontend
    'http://localhost:3001',    // Si alguna vez sirves el frontend desde el mismo puerto local que el backend (menos común)
    'http://127.0.0.1:5500',    // Para Live Server de VSCode si pruebas el frontend localmente
    // Puedes añadir más orígenes de desarrollo si los necesitas
];

const corsOptions = {
  origin: function (origin, callback) {
    // `origin` será undefined para peticiones del mismo origen o algunas herramientas como Postman
    // Permitir si no hay origin o si el origin está en la lista blanca
    if (!origin || allowedOrigins.includes(origin)) {
      console.log(`CORS: Permitiendo origen: ${origin || 'desconocido (probablemente misma-maquina o herramienta API)'}`);
      callback(null, true);
    } else {
      console.error(`CORS: Origen BLOQUEADO: ${origin}. No está en la lista blanca: ${allowedOrigins.join(', ')}`);
      callback(new Error('No permitido por CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Asegúrate de incluir OPTIONS
  allowedHeaders: ['Content-Type', 'Authorization'], // Cabeceras que tu frontend envía
  credentials: true, // Si alguna vez manejas cookies o sesiones de autenticación basadas en ellas
  optionsSuccessStatus: 200 // Algunos navegadores antiguos (IE11) se ahogan con 204
};

app.use(cors(corsOptions));

// Importante: Express maneja las peticiones OPTIONS automáticamente si usas app.use(cors()) ANTES de tus rutas.
// Si por alguna razón esto no fuera suficiente (muy raro con el paquete `cors`), podrías añadir un manejador explícito:
// app.options('*', cors(corsOptions)); // Habilita pre-flight para todas las rutas

app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

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

app.use('/api/*', (req, res) => {
    res.status(404).json({ error: `Ruta API no encontrada: ${req.method} ${req.originalUrl}` });
});

app.listen(PORT, () => {
    console.log(`Servidor SIVIC corriendo en el puerto ${PORT}`);
    if (process.env.NODE_ENV !== 'production') {
        console.log(`Acceso local (si aplica): http://localhost:${PORT}`);
        console.log(`CORS permitirá peticiones desde: ${allowedOrigins.join(', ')}`);
    }
});