import pool from "../config/db.js"; // adjust path to your db config

export const getApplications = async (req, res) => {
  try {
    const [applications] = await pool.query(
      `SELECT 
         a.id AS application_id,
         u.name AS applicant_name,
         j.title AS job_title,
         a.resume_path,
         a.status
       FROM applications a
       JOIN users u ON a.user_id = u.id
       JOIN jobs j ON a.job_id = j.id
       WHERE j.employer_id = ?`,
      [req.user.id] // assumes JWT middleware sets req.user
    );

    res.json(applications);
  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json({ message: "Server error fetching applications" });
  }
};

export const updateApplicationStatus = async (req, res) => {
  const { applicationId } = req.params;
  const { status } = req.body;

  console.log("Updating status for application ID:", applicationId);
  console.log("New status:", status);
  console.log("User ID from token:", req.user?.id);

  const validStatuses = ['pending', 'reviewed', 'rejected', 'selected'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  try {
    const [check] = await pool.query(
      `SELECT a.id 
       FROM applications a 
       JOIN jobs j ON a.job_id = j.id 
       WHERE a.id = ? AND j.employer_id = ?`,
      [applicationId, req.user.id]
    );

    if (check.length === 0) {
      console.error("Unauthorized: Application not found or belongs to another employer");
      return res.status(403).json({ message: 'Unauthorized to update this application' });
    }

    const [result] = await pool.query(
      'UPDATE applications SET status = ? WHERE id = ?',
      [status, applicationId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Application not found' });
    }

    res.json({ message: 'Status updated successfully' });
  } catch (error) {
    console.error('❌ Status update error:', error);
    res.status(500).json({ message: 'Failed to update application status' });
  }
};
