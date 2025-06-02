import express from 'express';
import {
  getAllJobs,
  getJobById,
  createJob, // ✅ Add this
} from '../controllers/jobsController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import authorizeRoles from '../middlewares/authorizeRoles.js';

const router = express.Router();

router.get('/', getAllJobs);
router.get('/:id', getJobById);

// ✅ New: Employers can post a job
router.post('/', verifyToken, authorizeRoles('employer', 'recruiter'), createJob);

export default router;
