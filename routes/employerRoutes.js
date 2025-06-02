import express from 'express';
import { getApplications, updateApplicationStatus } from '../controllers/employerController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/applications', verifyToken, getApplications);
router.patch('/applications/:applicationId/status', verifyToken, updateApplicationStatus);

export default router;
