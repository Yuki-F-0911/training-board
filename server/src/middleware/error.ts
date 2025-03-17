import { Request, Response, NextFunction } from 'express';

interface ErrorResponse extends Error {
  statusCode?: number;
  code?: number;
}

export const errorHandler = (
  err: ErrorResponse,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = { ...err };
  error.message = err.message;

  // MongoDBのIDエラー
  if (err.name === 'CastError') {
    error.message = '無効なIDです';
    error.statusCode = 400;
  }

  // 重複キーエラー
  if (err.code === 11000) {
    error.message = 'この値は既に使用されています';
    error.statusCode = 400;
  }

  // バリデーションエラー
  if (err.name === 'ValidationError') {
    error.message = Object.values(err).map((val: any) => val.message).join(', ');
    error.statusCode = 400;
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'サーバーエラーが発生しました',
  });
}; 