import pool from '../config/db.js';

export const applyToJob = async (req, res) => {
  const { jobId } = req.params;

  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const userId = req.user.id;

  if (!req.file) {
    return res.status(400).json({ message: 'Resume file is required' });
  }

  const resumePath = `uploads/resumes/${req.file.filename}`;

  try {
    // Check for existing application
    const [existing] = await pool.query(
      'SELECT id FROM applications WHERE user_id = ? AND job_id = ?',
      [userId, jobId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'You have already applied to this job.' });
    }

    // Insert new application
    await pool.query(
      'INSERT INTO applications (user_id, job_id, resume_path, status, applied_at) VALUES (?, ?, ?, ?, NOW())',
      [userId, jobId, resumePath, 'pending']
    );

    res.status(201).json({ message: 'Application submitted successfully' });
  } catch (err) {
    console.error('Application submission error:', err);
    res.status(500).json({ message: 'Failed to submit application' });
  }
};


// Get all jobs a seeker has applied to
export const getAppliedJobs = async (req, res) => {
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
};
