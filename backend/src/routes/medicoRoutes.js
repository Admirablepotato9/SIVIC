// backend/src/routes/medicoRoutes.js
import express from 'express';
import { listarMedicosAprobados, actualizarDisponibilidadMedico } from '../controllers/medicoController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Ruta para listar médicos (GET /api/medicos)
router.get('/', listarMedicosAprobados); 

// Ruta para que un médico actualice SU PROPIA disponibilidad
router.put(
    '/me/disponibilidad', // Esto resulta en PUT /api/medicos/me/disponibilidad
    requireAuth, 
    (req, res, next) => { // Middleware específico para verificar rol Médico para esta ruta
        if (!req.user || !req.user.profile || req.user.profile.role !== 'Medico') {
            return res.status(403).json({ error: 'Acceso denegado. Esta acción es solo para médicos.' });
        }
        // Verificar que el perfil del médico tenga la estructura esperada (perfiles_medicos)
        // Esto es más una salvaguarda, el controlador principal también debería verificar
        if (!req.user.profile.perfiles_medicos || req.user.profile.perfiles_medicos.length === 0) {
            // Esto podría pasar si el trigger no creó la entrada en perfiles_medicos
            // o si la consulta en authMiddleware no la está trayendo correctamente.
            console.warn('MEDICO_ROUTES: /me/disponibilidad - El perfil del médico no tiene detalles en perfiles_medicos.');
            // No bloqueamos aquí necesariamente, dejamos que el controlador lo maneje,
            // pero es una señal de alerta.
        }
        next();
    },
    actualizarDisponibilidadMedico
);

export default router;