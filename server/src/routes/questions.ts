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

// 質問一覧・詳細表示（公開）
router.get('/', async (req, res) => {
  return await getQuestions(req as AuthRequest, res);
});
router.get('/:id', async (req, res) => {
  return await getQuestion(req as unknown as AuthRequest, res);
});

// 認証が必要な操作
router.post('/', auth, async (req, res) => {
  return await createQuestion(req as unknown as AuthRequest, res);
});
router.put('/:id', auth, async (req, res) => {
  return await updateQuestion(req as unknown as AuthRequest, res);
});
router.delete('/:id', async (req, res) => {
  return await deleteQuestion(req as unknown as AuthRequest, res);
});
router.post('/:id/vote', async (req, res) => {
  return await voteQuestion(req as unknown as AuthRequest, res);
});
export default router; 