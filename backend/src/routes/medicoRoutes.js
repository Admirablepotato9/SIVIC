// backend/src/routes/medicoRoutes.js
import express from 'express';
import { listarMedicosAprobados, actualizarDisponibilidadMedico } from '../controllers/medicoController.js';
import { requireAuth, checkRole } from '../middleware/authMiddleware.js'; // Asumiendo que estos existen

const router = express.Router();

// Ruta pública para que pacientes vean médicos disponibles
router.get('/', listarMedicosAprobados);

// Ruta protegida para que un médico actualice su disponibilidad
router.put('/me/disponibilidad', requireAuth, checkRole(['Medico']), actualizarDisponibilidadMedico);

export default router;