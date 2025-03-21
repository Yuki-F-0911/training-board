import { Request, Response } from 'express';
import { User } from '../models/User';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../middleware/auth';
import bcrypt from 'bcryptjs';

// JWTトークン生成
const generateToken = (id: string) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET || 'defaultsecret', {
    expiresIn: '30d',
  });
  console.log('Generated token for user:', id);
  return token;
};

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
export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // ユーザー検索
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ message: '認証に失敗しました' });
    }

    // パスワード照合
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(401).json({ message: '認証に失敗しました' });
    }

    // トークン生成とレスポンス
    const token = generateToken(user._id.toString());
    console.log('Login successful for:', email);
    console.log('User ID:', user._id.toString());
    console.log('Generated token:', token);
    
    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
};

// @desc    現在のユーザー情報の取得
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: '認証されていません' });
    }
    
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'ユーザーが見つかりません' });
    }
    
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}; 