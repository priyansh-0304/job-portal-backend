import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { verifyToken } from '../middlewares/authMiddleware.js';
import pool from '../config/db.js';
import { applyToJob } from '../controllers/applicationController.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const resumesDir = path.join(__dirname, '../uploads/resumes/');
if (!fs.existsSync(resumesDir)) {
  fs.mkdirSync(resumesDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, resumesDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

const upload = multer({ storage, fileFilter });

// APPLY TO JOB
router.post('/:jobId', verifyToken, upload.single('resume'), applyToJob);

// GET applied jobs
router.get('/seeker/applied-jobs', verifyToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const [rows] = await pool.query(
      `SELECT 
         j.id AS id,
         j.title AS title,
         c.name AS company,
         a.applied_at AS applied_at
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       JOIN companies c ON j.company_id = c.id
       WHERE a.user_id = ?
       ORDER BY a.applied_at DESC`,
      [userId]
    );

    res.json({ jobs: rows });
  } catch (err) {
    console.error("Error fetching applied jobs:", err);
    res.status(500).json({ message: "Failed to fetch applied jobs" });
  }
});

export default router;
