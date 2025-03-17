import { Request, Response } from 'express';
import { User } from '../models/User';
import { generateToken, AuthRequest } from '../middleware/auth';

// @desc    ユーザー登録
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    // ユーザーの存在確認
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'このメールアドレスは既に使用されています' });
    }

    // ユーザーの作成
    const user = await User.create({
      username,
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token: generateToken(user._id.toString()),
      });
    }
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    ユーザーログイン
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // ユーザーの検索
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'メールアドレスまたはパスワードが正しくありません' });
    }

    // パスワードの検証
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'メールアドレスまたはパスワードが正しくありません' });
    }

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token: generateToken(user._id.toString()),
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    現在のユーザー情報の取得
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ message: '認証が必要です' });
    }
    
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
}; 