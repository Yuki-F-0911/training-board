import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

export interface AuthRequest extends Request {
  user?: {
    _id: string;
  };
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // トークンの取得
      const token = req.headers.authorization.split(' ')[1];

      // トークンの検証
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'defaultsecret') as { id: string };

      // ユーザー情報の取得（パスワードを除く）
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        res.status(401).json({ message: '認証に失敗しました' });
        return;
      }

      req.user = { _id: user._id.toString() };
      next();
    } catch (error) {
      res.status(401).json({ message: '認証に失敗しました' });
    }
  } else {
    res.status(401).json({ message: 'トークンがありません' });
  }
};

export const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'defaultsecret', {
    expiresIn: '30d',
  });
}; 