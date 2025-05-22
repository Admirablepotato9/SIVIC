// backend/src/routes/profileRoutes.js
import express from 'express';
import { getMyProfile, updateMyProfile } from '../controllers/profileController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/me', requireAuth, getMyProfile);
router.put('/me', requireAuth, updateMyProfile);

export default router;