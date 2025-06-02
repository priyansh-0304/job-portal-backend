import pool from '../config/db.js';

export const getAllUsers = async (req, res) => {
  try {
    const [users] = await pool.query(`
      SELECT users.id, users.name, users.email, roles.name AS role 
      FROM users
      JOIN roles ON users.role_id = roles.id
    `);
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteUser = async (req, res) => {
  const userId = req.params.id;

  try {
    const [[user]] = await pool.query(
      `SELECT role_id FROM users WHERE id = ?`, [userId]
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role_id === 1) {
      return res.status(403).json({ message: 'Cannot delete another admin' });
    }

    await pool.query('DELETE FROM applications WHERE user_id = ?', [userId]);
    await pool.query('DELETE FROM companies WHERE user_id = ?', [userId]);
    await pool.query('DELETE FROM users WHERE id = ?', [userId]);

    res.json({ message: 'User deleted successfully' });

  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, role } = req.body;

  const requestingUserId = req.user.id; // this comes from JWT middleware
  const roleMap = {
    admin: 1,
    recruiter: 2,
    candidate: 3,
    jobseeker: 4,
  };

  const newRoleId = roleMap[role];
  if (!newRoleId) {
    return res.status(400).json({ message: 'Invalid role specified' });
  }

  try {
    // Fetch target user
    const [[targetUser]] = await pool.query(
      'SELECT role_id FROM users WHERE id = ?',
      [id]
    );

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isTargetAdmin = targetUser.role_id === 1;
    const isSelfUpdate = parseInt(id) === parseInt(requestingUserId);

    // ❌ If target is admin and it's NOT self-update => forbidden
    if (isTargetAdmin && !isSelfUpdate) {
      return res.status(403).json({ message: 'Cannot update another admin' });
    }

    // ✅ Allow update
    await pool.query(
      'UPDATE users SET name = ?, email = ?, role_id = ? WHERE id = ?',
      [name, email, newRoleId, id]
    );

    res.json({ message: 'User updated successfully' });
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ message: 'Server error' });
  }
};





