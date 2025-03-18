import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

export interface AuthRequest extends Request {
  user?: {
    _id: string;
  };
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;

  // ヘッダーからトークンを取得
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // トークンを取得
      token = req.headers.authorization.split(' ')[1];
      console.log('Received token:', token.substring(0, 15) + '...');  // セキュリティのため一部だけ表示

      // トークンの検証
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'defaultsecret') as jwt.JwtPayload;
      console.log('Decoded token ID:', decoded.id);

      if (!decoded || typeof decoded !== 'object' || !decoded.id) {
        console.log('Invalid token format:', decoded);
        return res.status(401).json({ message: 'トークンの形式が無効です' });
      }

      // ユーザー情報の取得（パスワードを除く）
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        console.log('User not found for id:', decoded.id);
        return res.status(401).json({ message: 'ユーザーが見つかりません' });
      }

      console.log('Authentication successful for user:', user._id.toString());
      // リクエストにユーザー情報を追加
      req.user = { _id: user._id.toString() };
      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({ message: '認証に失敗しました', error: error.message });
    }
  } else {
    console.log('No token provided. Headers:', JSON.stringify(req.headers));
    return res.status(401).json({ message: 'トークンがありません' });
  }
};

export const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'defaultsecret', {
    expiresIn: '30d',
  });
}; 