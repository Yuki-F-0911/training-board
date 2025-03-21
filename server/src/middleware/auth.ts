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

  console.log('認証ミドルウェア開始, Headers:', JSON.stringify(req.headers));

  try {
    // ヘッダーからトークンを取得
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      // トークンを取得
      token = req.headers.authorization.split(' ')[1];
      console.log('受信したトークン:', token.substring(0, 15) + '...');  // セキュリティのため一部だけ表示

      if (!token || token === 'null' || token === 'undefined') {
        console.log('無効なトークン:', token);
        return res.status(401).json({ message: 'トークンが無効です' });
      }

      try {
        // トークンの検証
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'defaultsecret') as jwt.JwtPayload;
        console.log('デコードされたトークン:', JSON.stringify(decoded));

        // ユーザーIDを抽出 - 新旧フォーマットに対応
        let userId;
        if (decoded.user && decoded.user.id) {
          // 新フォーマット {user: {id: '...'}}
          userId = decoded.user.id;
          console.log('新フォーマットのユーザーID:', userId);
        } else if (decoded.id) {
          // 旧フォーマット {id: '...'}
          userId = decoded.id;
          console.log('旧フォーマットのユーザーID:', userId);
        } else {
          console.log('トークン形式が無効:', decoded);
          return res.status(401).json({ message: 'トークンの形式が無効です' });
        }

        // ユーザー情報の取得（パスワードを除く）
        const user = await User.findById(userId).select('-password');
        if (!user) {
          console.log('ユーザーが見つかりません:', userId);
          return res.status(401).json({ message: 'ユーザーが見つかりません' });
        }

        console.log('認証成功 - ユーザー:', user._id.toString());
        // リクエストにユーザー情報を追加
        req.user = { _id: user._id.toString() };
        next();
      } catch (jwtError) {
        console.error('JWT検証エラー:', jwtError);
        return res.status(401).json({ 
          message: '認証に失敗しました', 
          error: jwtError instanceof Error ? jwtError.message : '不明なエラー' 
        });
      }
    } else {
      console.log('トークンが提供されていません. ヘッダー:', JSON.stringify(req.headers));
      return res.status(401).json({ message: 'Authorizationヘッダーにトークンがありません' });
    }
  } catch (error) {
    console.error('認証ミドルウェアの予期しないエラー:', error);
    return res.status(500).json({ 
      message: '認証処理中にエラーが発生しました', 
      error: error instanceof Error ? error.message : '不明なエラー' 
    });
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