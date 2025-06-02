import express from 'express';
import { login, register } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', register);

// Optional test route
router.get('/test', (req, res) => {
  res.send('Auth route working');
});

export default router;
