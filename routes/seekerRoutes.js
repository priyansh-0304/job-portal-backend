import express from "express";
import { getAppliedJobs } from "../controllers/seekerController.js";
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// GET /api/seeker/applied-jobs
router.get("/applied-jobs", verifyToken, getAppliedJobs);


export default router;
