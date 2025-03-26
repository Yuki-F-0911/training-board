import express from 'express';
import {
  getAnswers,
  getAnswerById,
  createAnswer,
  updateAnswer,
  deleteAnswer,
  voteAnswer,
} from '../controllers/answers';
import { auth } from '../middleware/auth';

const router = express.Router({ mergeParams: true });

// 回答を取得
router.get('/', getAnswers);
router.get('/:id', getAnswerById);

// 回答を作成
router.post('/', auth, createAnswer);

// 回答を更新
router.put('/:id', auth, updateAnswer);

// 回答を削除
router.delete('/:id', auth, deleteAnswer);

// 回答の投票
router.post('/:id/vote', auth, voteAnswer);

export default router; 