import express from 'express';
import { registerUser, loginUser, getCurrentUser } from '../controllers/auth';
import { protect } from '../middleware/auth';

const router = express.Router();

// ユーザー登録エンドポイント
router.post('/register', registerUser);

// ログインエンドポイント
router.post('/login', loginUser);

// 現在ログイン中のユーザー情報取得エンドポイント
router.get('/me', protect, getCurrentUser);

export default router; 