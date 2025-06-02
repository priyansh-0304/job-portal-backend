import pool from '../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Register a new user
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Check if user already exists
    const [existingUsers] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 2. Fetch role_id from roles table
    const [roleRows] = await pool.execute('SELECT id FROM roles WHERE name = ?', [role]);
    if (roleRows.length === 0) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }
    const roleId = roleRows[0].id;

    // 3. Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Insert user into DB
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password, role_id) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, roleId]
    );

    const userId = result.insertId;

    // 5. Create JWT
    const token = jwt.sign(
      { id: userId, email, role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // 6. Send response
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: userId, name, email, role }
    });

  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// User login
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Find user with role
    const [users] = await pool.execute(
      `SELECT users.*, roles.name AS role 
       FROM users 
       JOIN roles ON users.role_id = roles.id 
       WHERE email = ?`,
      [email]
    );

    if (users.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const user = users[0];

    // 2. Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // 3. Sign JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    console.log("User from DB:", user);
    console.log("Entered password:", password);
    console.log("Hashed password:", user.password);

    // 4. Respond with user info and token
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
};
