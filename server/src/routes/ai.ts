import express from 'express';
import {
  generateQuestion,
  generateAnswer,
  evaluateAnswer,
} from '../controllers/ai';
import { protect } from '../middleware/auth';

const router = express.Router();

router.post('/generate-question', protect, generateQuestion);
router.post('/generate-answer/:questionId', protect, generateAnswer);
router.post('/evaluate-answer/:answerId', protect, evaluateAnswer);

export default router; 