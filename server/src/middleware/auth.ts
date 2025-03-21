import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

// 認証リクエストの拡張インターフェース
export interface AuthRequest extends Request {
  user: {
    id: string;
    [key: string]: any;
  };
}

// 認証ミドルウェア
export const auth = async (req: Request, res: Response, next: NextFunction) => {
  // トークンを取得
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  // リクエストのデバッグ情報
  console.log('認証リクエスト:', {
    path: req.path,
    method: req.method,
    hasToken: !!token
  });

  if (!token) {
    console.log('Authorizationヘッダーにトークンがありません');
    return res.status(401).json({ message: 'Authorizationヘッダーにトークンがありません' });
  }

  try {
    // トークンの検証
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret_key');
    console.log('トークン検証成功:', typeof decoded);
    
    // トークンのペイロード形式を確認
    if (typeof decoded !== 'object') {
      throw new Error('無効なトークン形式');
    }
    
    // 新しいフォーマット: { user: { id: '...' } }
    if (decoded.user && decoded.user.id) {
      (req as AuthRequest).user = decoded.user;
      console.log('ユーザーID設定 (新形式):', decoded.user.id);
    } 
    // 旧フォーマット: { id: '...' }
    else if (decoded.id) {
      (req as AuthRequest).user = { id: decoded.id };
      console.log('ユーザーID設定 (旧形式):', decoded.id);
    }
    // 無効なペイロード
    else {
      throw new Error('トークンにユーザーIDが含まれていません');
    }

    next();
  } catch (error: unknown) {
    console.error('トークン検証エラー:', error);
    const errorMessage = error instanceof Error ? error.message : '不明なエラー';
    
    // 詳細なエラーメッセージ
    if (error instanceof jwt.JsonWebTokenError) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'トークンの有効期限が切れています' });
      } else {
        return res.status(401).json({ message: '無効なトークンです' });
      }
    }
    
    res.status(401).json({ message: '認証に失敗しました', error: errorMessage });
  }
};

export const generateToken = (id: string) => {
  // 新しいフォーマットでトークンを生成
  const payload = {
    user: {
      id
    }
  };
  
  const token = jwt.sign(payload, process.env.JWT_SECRET || 'defaultsecret', {
    expiresIn: '30d',
  });
  
  console.log(`トークン生成: ユーザーID=${id}, トークン=${token.substring(0, 15)}...`);
  return token;
}; 