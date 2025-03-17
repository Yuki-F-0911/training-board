import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

interface AuthRequest extends Request {
  user?: any;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // トークンの取得
      token = req.headers.authorization.split(' ')[1];

      // トークンの検証
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

      // ユーザー情報の取得（パスワードを除く）
      req.user = await User.findById((decoded as any).id).select('-password');

      next();
    } catch (error) {
      res.status(401).json({ message: '認証に失敗しました' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'トークンが見つかりません' });
  }
};

export const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: '30d',
  });
}; 