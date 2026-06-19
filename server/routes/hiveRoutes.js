import express from 'express';
import {
  createHive,
  getStreamToken,
  endHive,
  getAllHives,
  getSingleHive,
  getBroadcasterAnalytics,
  addQuestion,
  answerQuestion,
  toggleBookmark
} from '../controllers/hiveController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.post('/', protect, upload.single('thumbnail'), createHive);
router.get('/', getAllHives);
router.get('/analytics', protect, getBroadcasterAnalytics);
router.get('/:hiveId', getSingleHive);
router.get('/:hiveId/token', protect, getStreamToken);
router.put('/:hiveId/end', protect, endHive);
router.post('/:hiveId/questions', protect, addQuestion);
router.put('/:hiveId/questions/:questionId/answer', protect, answerQuestion);
router.post('/:hiveId/bookmark', protect, toggleBookmark);

export default router;