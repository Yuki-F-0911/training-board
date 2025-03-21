import { Request, Response } from 'express';
import { User } from '../models/User';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../middleware/auth';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

// @desc    ユーザー登録
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  try {
    // 既存ユーザーのチェック
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'このメールアドレスは既に登録されています' });
    }

    // 新規ユーザー作成
    user = new User({
      username,
      email,
      password
    });

    // パスワードのハッシュ化はUserモデルのpre-save hookで行われる

    // ユーザーを保存
    await user.save();

    // JWTトークンの生成
    const payload = {
      user: {
        id: user.id
      }
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'defaultsecret',
      { expiresIn: '24h' }
    );

    console.log(`新規ユーザー登録成功: ${user.id}, ${user.email}`);
    console.log(`トークン発行: ${token.substring(0, 15)}...`);

    res.status(201).json({
      message: 'ユーザー登録が完了しました',
      user: {
        _id: user.id,
        username: user.username,
        email: user.email
      },
      token
    });
  } catch (error) {
    console.error('ユーザー登録エラー:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
};

// @desc    ユーザーログイン
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // ユーザーの検索
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'メールアドレスまたはパスワードが正しくありません' });
    }

    // パスワードの検証
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'メールアドレスまたはパスワードが正しくありません' });
    }

    // JWTトークンの生成
    const payload = {
      user: {
        id: user.id
      }
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'defaultsecret',
      { expiresIn: '24h' }
    );

    console.log(`ユーザーログイン成功: ${user.id}, ${user.email}`);
    console.log(`トークン発行: ${token.substring(0, 15)}...`);

    // トークンとユーザー情報を返す
    res.json({
      message: 'ログインに成功しました',
      user: {
        _id: user.id,
        username: user.username,
        email: user.email
      },
      token
    });
  } catch (error) {
    console.error('ログインエラー:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
};

// @desc    現在のユーザー情報の取得
// @route   GET /api/auth/me
// @access  Private
export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    // req.userはauthミドルウェアで設定される
    if (!req.user) {
      return res.status(401).json({ message: '認証されていません' });
    }

    const userId = req.user._id;
    
    // ユーザーIDが有効なMongoDBのIDかチェック
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: '無効なユーザーIDです' });
    }

    // ユーザー情報の取得（パスワードを除く）
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'ユーザーが見つかりません' });
    }

    console.log(`ユーザー情報取得成功: ${userId}`);
    res.json(user);
  } catch (error) {
    console.error('ユーザー情報取得エラー:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
}; 