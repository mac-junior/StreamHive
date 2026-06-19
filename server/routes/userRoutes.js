import express from 'express';
import { getProfile, updateProfile, followUser } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.get('/:userId', getProfile);
router.put('/profile', protect, upload.single('avatar'), updateProfile);
router.post('/:userId/follow', protect, followUser);

export default router;