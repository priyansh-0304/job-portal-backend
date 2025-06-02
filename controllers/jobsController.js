import pool from '../config/db.js';

export const getJobById = async (req, res) => {
  const jobId = req.params.id;
  try {
    const [rows] = await pool.query(
      `SELECT 
         j.id, 
         j.title, 
         j.description, 
         j.location, 
         j.type, 
         j.salary_range AS salary, 
         j.created_at, 
         c.name AS company
       FROM jobs j
       JOIN companies c ON j.company_id = c.id
       WHERE j.id = ?`,
      [jobId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Error fetching job by ID:", error);
    res.status(500).json({ message: "Server error fetching job details" });
  }
};


export const getAllJobs = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, title, location, type, salary_range AS salary FROM jobs'
    );
    res.json(rows);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ message: 'Server error fetching jobs' });
  }
};


export const createJob = async (req, res) => {
  const { title, description, location, type, salary_range } = req.body;
  const employerId = req.user.id;

  // ✅ Role check
  if (req.user.role !== 'employer' && req.user.role !== 'recruiter') {
    return res.status(403).json({ message: 'Access denied: insufficient permissions' });
  }

  try {
    const [companyRows] = await pool.query(
      'SELECT id FROM companies WHERE user_id = ?',
      [employerId]
    );

    if (companyRows.length === 0) {
      return res.status(400).json({ message: 'No company found for this employer' });
    }

    const companyId = companyRows[0].id;

    await pool.query(
      `INSERT INTO jobs (title, description, location, type, salary_range, company_id, employer_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [title, description, location, type, salary_range, companyId, employerId]
    );

    res.status(201).json({ message: 'Job posted successfully' });
  } catch (error) {
    console.error('Error posting job:', error);
    res.status(500).json({ message: 'Server error while posting job' });
  }
};
