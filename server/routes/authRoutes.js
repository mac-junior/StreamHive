import express from 'express';
import { register, login, getCurrentUser, logout } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.post('/register', upload.single('avatar'), register);
router.post('/login', login);
router.get('/me', protect, getCurrentUser);
router.post('/logout', protect, logout);

export default router;