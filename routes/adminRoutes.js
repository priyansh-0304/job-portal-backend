import express from 'express';
import { getAllUsers, deleteUser, updateUser } from '../controllers/adminController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import authorizeRoles from '../middlewares/authorizeRoles.js';

const router = express.Router();

router.get('/users', verifyToken, authorizeRoles('admin'), getAllUsers);
router.delete('/users/:id', verifyToken, authorizeRoles('admin'), deleteUser);
router.put('/users/:id', verifyToken, authorizeRoles('admin'), updateUser);

export default router;
