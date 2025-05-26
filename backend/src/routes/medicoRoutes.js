// backend/src/routes/medicoRoutes.js
import express from 'express';
import { listarMedicosAprobados, actualizarDisponibilidadMedico } from '../controllers/medicoController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
// import { checkRole } from '../middleware/authMiddleware.js'; // Descomentar si creas checkRole

const router = express.Router();

// Ruta pública para que pacientes vean médicos disponibles
// GET /api/medicos
router.get('/', listarMedicosAprobados); // Podría estar protegida si solo usuarios logueados pueden ver

// Ruta protegida para que un médico actualice su disponibilidad
// PUT /api/medicos/me/disponibilidad
router.put(
    '/me/disponibilidad', 
    requireAuth, 
    // (req, res, next) => { // Middleware para verificar si es médico
    //     if (req.user.profile.role !== 'Medico') {
    //         return res.status(403).json({ error: 'Acceso denegado. Solo para médicos.' });
    //     }
    //     next();
    // },
    actualizarDisponibilidadMedico
);
// Nota: Idealmente, el middleware checkRole(['Medico']) manejaría la verificación de rol de forma más limpia.

export default router;