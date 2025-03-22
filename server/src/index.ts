import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database';
import { errorHandler } from './middleware/error';
import authRoutes from './routes/auth';
import questionRoutes from './routes/questions';
import aiRoutes from './routes/ai';
import bookmarkRoutes from './routes/bookmarks';
import { startAutoPostJob } from './jobs/autoPost';

// Load environment variables
dotenv.config();

// Connect to MongoDB
try {
  console.log('データベース接続を開始します: ', process.env.MONGODB_URI);
  connectDB();
  console.log('データベース接続が成功しました');
} catch (error: unknown) {
  console.error('データベース接続の初期化に失敗しました:', error);
}

// Create Express app
const app = express();

// CORS設定 - 完全に緩める
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  // プリフライトリクエストへの対応
  if (req.method === 'OPTIONS') {
    console.log('プリフライトリクエスト検出:', req.headers.origin);
    return res.status(200).end();
  }

  next();
});

// Content-Type設定
app.use(express.json());

// エラーハンドリングのミドルウェア - 非同期エラー向け
app.use((err: any, req: any, res: any, next: any) => {
  console.error('エラーハンドリングミドルウェア:', err);
  res.status(500).json({ 
    message: 'サーバーエラーが発生しました', 
    error: process.env.NODE_ENV === 'production' ? '詳細はサーバーログを確認してください' : err.message
  });
});

// ルートパスのハンドラー
app.get('/', (req, res) => {
  try {
    res.json({ message: 'トレーニング掲示板APIサーバーが正常に動作しています' });
  } catch (error: unknown) {
    console.error('ルートエンドポイントエラー:', error);
    const errorMessage = error instanceof Error ? error.message : '不明なエラー';
    res.status(500).json({ 
      message: 'エラーが発生しました', 
      error: process.env.NODE_ENV === 'production' ? '詳細はサーバーログを確認してください' : errorMessage
    });
  }
});

// ヘルスチェックエンドポイント
app.get('/health', (req, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    const dbStatus: Record<number, string> = {
      0: '切断済み',
      1: '接続済み',
      2: '接続中',
      3: '切断中',
    };
    res.status(200).json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      db: dbStatus[dbState] || '不明'
    });
  } catch (error: unknown) {
    console.error('ヘルスチェックエラー:', error);
    const errorMessage = error instanceof Error ? error.message : '不明なエラー';
    res.status(500).json({ 
      status: 'error', 
      message: 'ヘルスチェック中にエラーが発生しました',
      error: process.env.NODE_ENV === 'production' ? '詳細はサーバーログを確認してください' : errorMessage
    });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/ai', aiRoutes);

// データベース接続
try {
  console.log('MongoDBに接続しています...');
  mongoose
    .connect(process.env.MONGODB_URI as string)
    .then(() => {
      console.log('データベースに接続しました');
      
      // AIユーザーの作成または取得
      const User = mongoose.model('User');
      User.findOneAndUpdate(
        { email: 'ai@training-board.com' },
        {
          username: 'AI Assistant',
          email: 'ai@training-board.com',
          password: require('crypto').randomBytes(32).toString('hex'),
        },
        { upsert: true, new: true }
      ).then((aiUser) => {
        console.log('AIユーザーを準備しました');
        // 自動投稿ジョブを開始
        startAutoPostJob().catch(error => {
          console.error('自動投稿ジョブエラー:', error);
        });
      }).catch(error => {
        console.error('AIユーザー作成エラー:', error);
      });
    })
    .catch((error) => {
      console.error('データベース接続エラー:', error);
    });
} catch (error: unknown) {
  console.error('MongoDBの接続処理で例外が発生しました:', error);
}

// Error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

try {
  app.listen(PORT, () => {
    console.log(`サーバーが起動しました: http://localhost:${PORT}`);
  });
} catch (error: unknown) {
  console.error('サーバー起動エラー:', error);
} 

export default app; 