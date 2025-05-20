// backend/src/routes/authRoutes.js
import express from 'express';
// Asegúrate de importar las nuevas funciones del controlador
import { registerUser, loginUser, logoutUser } from '../controllers/authController.js'; 

const router = express.Router();

// Ruta para registrar un nuevo usuario
// POST /api/auth/register
router.post('/register', registerUser);

// Ruta para iniciar sesión de un usuario
// POST /api/auth/login
router.post('/login', loginUser);

// Ruta para cerrar sesión de un usuario
// POST /api/auth/logout (Podría ser GET también, pero POST es común para acciones que cambian estado)
router.post('/logout', logoutUser);


export default router;