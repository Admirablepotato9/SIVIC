// backend/src/routes/citaRoutes.js
import express from 'express';
import {
    agendarCita,
    listarCitasPaciente,
    listarCitasMedico,
    actualizarEstadoCita,
    cancelarCitaPaciente
} from '../controllers/citaController.js';
import { requireAuth, checkRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Paciente agenda una cita
router.post('/', requireAuth, checkRole(['Paciente']), agendarCita);

// Paciente ve sus citas
router.get('/paciente/me', requireAuth, checkRole(['Paciente']), listarCitasPaciente);

// Médico ve sus citas
router.get('/medico/me', requireAuth, checkRole(['Medico']), listarCitasMedico);

// Médico actualiza estado de una cita (confirmar, completar, cancelar)
router.put('/:citaId/estado', requireAuth, checkRole(['Medico']), actualizarEstadoCita);

// Paciente cancela una cita
router.put('/:citaId/cancelar/paciente', requireAuth, checkRole(['Paciente']), cancelarCitaPaciente);


export default router;