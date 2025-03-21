import { Request, Response } from 'express';
import { User } from '../models/User';
import jwt from 'jsonwebtoken';
import { AuthRequest, generateToken } from '../middleware/auth';
import bcrypt from 'bcryptjs';

// @desc    ユーザー登録
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    
    console.log('ユーザー登録リクエスト:', { username, email });
    
    // ユーザーの存在確認
    const userExists = await User.findOne({ email });
    if (userExists) {
      console.log('メールアドレス既存:', email);
      return res.status(400).json({ message: 'このメールアドレスは既に使用されています' });
    }

    // ユーザーの作成
    const user = await User.create({
      username,
      email,
      password,
    });

    if (user) {
      const token = generateToken(user._id.toString());
      console.log('ユーザー登録成功:', { id: user._id, username: user.username });
      
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token,
      });
    }
  } catch (error: any) {
    console.error('ユーザー登録エラー:', error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    ユーザーログイン
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    console.log('ログインリクエスト:', email);
    
    // ユーザー検索
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('ユーザーが見つかりません:', email);
      return res.status(401).json({ message: '認証に失敗しました' });
    }

    // パスワード照合
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      console.log('パスワードが一致しません:', email);
      return res.status(401).json({ message: '認証に失敗しました' });
    }

    // トークン生成とレスポンス
    const token = generateToken(user._id.toString());
    console.log('ログイン成功:', { email, id: user._id.toString() });
    
    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token,
    });
  } catch (error) {
    console.error('ログインエラー:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
};

// @desc    現在のユーザー情報の取得
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      console.log('認証されていないユーザー');
      return res.status(401).json({ message: '認証されていません' });
    }
    
    console.log('ユーザー情報取得:', req.user._id);
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      console.log('ユーザーが見つかりません:', req.user._id);
      return res.status(404).json({ message: 'ユーザーが見つかりません' });
    }
    
    console.log('ユーザー情報取得成功:', { id: user._id, username: user.username });
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email
    });
  } catch (error: any) {
    console.error('ユーザー情報取得エラー:', error);
    res.status(500).json({ message: error.message });
  }
}; 