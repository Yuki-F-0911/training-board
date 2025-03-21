import { Request, Response } from 'express';
import { User } from '../models/User';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../middleware/auth';
import bcryptjs from 'bcryptjs';
import mongoose from 'mongoose';

// @desc    ユーザー登録
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    // 必須フィールドの確認
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'すべてのフィールドが必要です' });
    }

    // ユーザーが既に存在するかチェック
    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'このメールアドレスは既に登録されています' });
    }

    // パスワードのハッシュ化
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    // 新しいユーザーを作成
    const user = new User({
      username,
      email,
      password: hashedPassword,
    });

    await user.save();
    
    console.log(`新規ユーザー登録: ${email}, ID: ${user._id}`);

    // JWTトークンを生成
    const token = generateToken(user);

    res.status(201).json({
      message: 'ユーザー登録成功',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
      token,
    });
  } catch (error: unknown) {
    console.error('ユーザー登録エラー:', error);
    const errorMessage = error instanceof Error ? error.message : '不明なエラー';
    res.status(500).json({ message: '登録処理中にエラーが発生しました', error: errorMessage });
  }
};

// @desc    ユーザーログイン
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // 必須フィールドの確認
    if (!email || !password) {
      return res.status(400).json({ message: 'メールアドレスとパスワードが必要です' });
    }

    // ユーザーの検索
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'メールアドレスまたはパスワードが正しくありません' });
    }

    // パスワードの検証
    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'メールアドレスまたはパスワードが正しくありません' });
    }

    // JWTトークンを生成
    const token = generateToken(user);
    
    console.log(`ユーザーログイン: ${email}, ID: ${user._id}, トークン: ${token.substring(0, 20)}...`);

    res.json({
      message: 'ログイン成功',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
      token,
    });
  } catch (error: unknown) {
    console.error('ログインエラー:', error);
    const errorMessage = error instanceof Error ? error.message : '不明なエラー';
    res.status(500).json({ message: 'ログイン処理中にエラーが発生しました', error: errorMessage });
  }
};

// @desc    現在のユーザー情報の取得
// @route   GET /api/auth/me
// @access  Private
export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'ユーザーが見つかりません' });
    }
    
    console.log(`現在のユーザー情報取得: ID: ${user._id}`);
    
    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      }
    });
  } catch (error: unknown) {
    console.error('現在のユーザー情報取得エラー:', error);
    const errorMessage = error instanceof Error ? error.message : '不明なエラー';
    res.status(500).json({ message: 'ユーザー情報の取得中にエラーが発生しました', error: errorMessage });
  }
};

// トークン生成関数
const generateToken = (user: any): string => {
  const payload = {
    user: {
      id: user._id
    }
  };
  
  try {
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'default_secret_key',
      { expiresIn: '7d' }
    );
    console.log(`トークン生成成功: ユーザーID ${user._id}, ペイロード:`, JSON.stringify(payload));
    return token;
  } catch (error) {
    console.error('トークン生成エラー:', error);
    throw new Error('認証トークンの生成に失敗しました');
  }
}; 