import express from 'express';
import { registerUser, loginUser, getCurrentUser } from '../controllers/auth';
import { auth, AuthRequest } from '../middleware/auth';

const router = express.Router();

// @route   POST /api/auth/register
// @desc    ユーザー登録
// @access  Public
router.post('/register', registerUser);

// @route   POST /api/auth/login
// @desc    ユーザーログイン、トークン取得
// @access  Public
router.post('/login', loginUser);

// @route   GET /api/auth/me
// @desc    現在のユーザー情報を取得
// @access  Private
router.get('/me', auth, async (req, res) => {
  return await getCurrentUser(req as AuthRequest, res);
});

export default router; 