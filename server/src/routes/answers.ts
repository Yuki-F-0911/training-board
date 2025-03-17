import express from 'express';
import {
  createAnswer,
  getAnswers,
  updateAnswer,
  deleteAnswer,
  voteAnswer,
  acceptAnswer,
} from '../controllers/answers';
import { protect } from '../middleware/auth';

const router = express.Router({ mergeParams: true });

// 公開ルート
router.get('/', getAnswers);

// 保護されたルート
router.post('/', protect, createAnswer);
router.put('/:id', protect, updateAnswer);
router.delete('/:id', protect, deleteAnswer);
router.post('/:id/vote', protect, voteAnswer);
router.post('/:id/accept', protect, acceptAnswer);

export default router; 