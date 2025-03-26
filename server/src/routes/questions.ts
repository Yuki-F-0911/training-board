import express from 'express';
import {
  getQuestions,
  getQuestion,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  voteQuestion,
} from '../controllers/questions';
import { auth, AuthRequest } from '../middleware/auth';
import answerRoutes from './answers';

const router = express.Router();

// 回答のルーターを質問IDをパラメータとして利用
router.use('/:questionId/answers', answerRoutes);

// 公開エンドポイント - 認証なしでアクセス可能
router.get('/', getQuestions);
router.get('/:id', getQuestion);

// 認証が必要なエンドポイント
router.post('/', auth, createQuestion);
router.put('/:id', auth, updateQuestion);
router.delete('/:id', auth, deleteQuestion);
router.post('/:id/vote', auth, voteQuestion);

export default router; 