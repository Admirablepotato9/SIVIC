// backend/src/routes/profileRoutes.js
import express from 'express';
import { getMyProfile, updateMyProfile } from '../controllers/profileController.js';
import { requireAuth } from '../middleware/authMiddleware.js'; // Importamos el middleware

const router = express.Router();

// Ruta para obtener el perfil del usuario autenticado
// GET /api/profile/me
// Esta ruta estará protegida por el middleware requireAuth
router.get('/me', requireAuth, getMyProfile);

// Ruta para actualizar el perfil del usuario autenticado
// PUT /api/profile/me
// Esta ruta también estará protegida por requireAuth
router.put('/me', requireAuth, updateMyProfile);

export default router;