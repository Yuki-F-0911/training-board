import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

// カスタムリクエスト型の拡張
export interface AuthRequest extends Request {
  user?: {
    id: string;
    _id: string; // MongoDBの_id型互換性のために追加
  };
}

// 認証ミドルウェア
export const auth = async (req: Request, res: Response, next: NextFunction) => {
  console.log(`認証処理開始: ${req.method} ${req.path}`);
  
  // OPTIONS メソッドは認証をスキップ
  if (req.method === 'OPTIONS') {
    console.log('OPTIONSリクエストのため認証スキップ');
    return res.status(200).end();
  }

  try {
    const tokenHeader = req.header('Authorization');
    console.log(`認証ヘッダー: ${tokenHeader || 'なし'}`);

    if (!tokenHeader) {
      console.log('トークンがありません - 認証失敗');
      return res.status(401).json({ message: '認証トークンがありません、認証が拒否されました' });
    }

    // Bearer トークンの形式であることを確認
    if (!tokenHeader.startsWith('Bearer ')) {
      console.log('無効なトークン形式 - 認証失敗');
      return res.status(401).json({ message: '無効なトークン形式です' });
    }

    // 'Bearer '部分を除去してトークンを取得
    const token = tokenHeader.substring(7);
    console.log(`検証するトークン: ${token.substring(0, 20)}...`);

    try {
      // トークンを検証
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
      console.log(`トークン検証成功: ユーザーID=${decoded.id}`);

      // リクエストオブジェクトにユーザー情報を追加
      // MongoDBの _id との互換性のために、idと_idの両方を設定
      (req as AuthRequest).user = { 
        id: decoded.id,
        _id: decoded.id 
      };
      
      console.log('認証成功 - 次の処理へ');
      next();
    } catch (error) {
      console.error('トークン検証エラー:', error);
      return res.status(401).json({ message: 'トークンが無効です' });
    }
  } catch (error) {
    console.error('認証処理エラー:', error);
    res.status(500).json({ message: '認証処理中にサーバーエラーが発生しました' });
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