import express from 'express';
import {
  createQuestion,
  getQuestions,
  getQuestion,
  updateQuestion,
  deleteQuestion,
  voteQuestion,
} from '../controllers/questions';
import { protect } from '../middleware/auth';
import answerRoutes from './answers';

const router = express.Router();

// 回答のルートをマウント
router.use('/:questionId/answers', answerRoutes);

// 公開ルート
router.get('/', getQuestions);
router.get('/:id', getQuestion);

// 保護されたルート
router.post('/', protect, createQuestion);
router.put('/:id', protect, updateQuestion);
router.delete('/:id', protect, deleteQuestion);
router.post('/:id/vote', protect, voteQuestion);

export default router; 