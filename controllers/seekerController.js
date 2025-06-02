import pool from "../config/db.js";

export const getAppliedJobs = async (req, res) => {
  const seekerId = req.user.id;

  try {
    const [rows] = await pool.query(
      `SELECT 
         j.id,
         j.title,
         c.name AS company,
         a.status,
         a.applied_at
       FROM applications AS a
       JOIN jobs AS j ON a.job_id = j.id
       JOIN companies AS c ON j.company_id = c.id
       WHERE a.user_id = ?
       ORDER BY a.applied_at DESC`,
      [seekerId]
    );

    res.json({ jobs: rows });
  } catch (err) {
    console.error("Error fetching applied jobs:", err);
    res.status(500).json({ message: "Server error fetching applications" });
  }
};
