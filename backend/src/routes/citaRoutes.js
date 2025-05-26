// backend/src/routes/citaRoutes.js
import express from 'express';
import { 
    agendarCita, 
    listarCitasPaciente, 
    listarCitasMedico, 
    actualizarEstadoCita,
    cancelarCitaPaciente
} from '../controllers/citaController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
// import { checkRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Paciente agenda una nueva cita
// POST /api/citas
router.post('/', requireAuth, /*checkRole(['Paciente']),*/ agendarCita);

// Paciente ve sus citas
// GET /api/citas/paciente/me
router.get('/paciente/me', requireAuth, /*checkRole(['Paciente']),*/ listarCitasPaciente);

// Médico ve sus citas
// GET /api/citas/medico/me
router.get('/medico/me', requireAuth, /*checkRole(['Medico']),*/ listarCitasMedico);

// Médico actualiza el estado de una cita
// PUT /api/citas/:citaId/estado
router.put('/:citaId/estado', requireAuth, /*checkRole(['Medico']),*/ actualizarEstadoCita);

// Paciente cancela una cita
// PUT /api/citas/:citaId/cancelar
router.put('/:citaId/cancelar', requireAuth, /*checkRole(['Paciente']),*/ cancelarCitaPaciente);


export default router;