import { Request, Response, NextFunction } from 'express';

interface CustomError extends Error {
  statusCode?: number;
  code?: number | string;
}

export const errorHandler = (
  err: CustomError, 
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  console.error('エラーハンドラーが呼び出されました：');
  console.error('エラーメッセージ:', err.message);
  console.error('エラーコード:', err.code || 'なし');
  console.error('リクエストパス:', req.path);
  console.error('リクエストメソッド:', req.method);
  
  // スタックトレースを表示（開発環境のみ）
  if (process.env.NODE_ENV !== 'production') {
    console.error('スタックトレース:', err.stack);
  }

  // MongoDBの重複キーエラー
  if (err.code === 11000) {
    const field = Object.keys(err as any)[0];
    return res.status(400).json({
      success: false,
      message: `この${field}は既に使用されています`
    });
  }

  // レスポンスを返す
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'サーバーエラーが発生しました',
    // 開発環境では詳細なエラー情報を返す
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
}; 