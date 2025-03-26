import express from 'express';
import { auth } from '../middleware/auth';
import { generateAnswer, evaluateAnswer } from '../controllers/ai';

const router = express.Router();

// AIに回答を生成させる
router.post('/answers/generate', auth, generateAnswer);

// AIの回答を評価する
router.post('/answers/evaluate/:answerId', auth, evaluateAnswer);

export default router; 