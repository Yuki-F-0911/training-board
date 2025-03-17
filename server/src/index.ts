import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database';
import { errorHandler } from './middleware/error';
import authRoutes from './routes/auth';
import questionRoutes from './routes/questions';
import aiRoutes from './routes/ai';
import { startAutoPostJob } from './jobs/autoPost';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Create Express app
const app = express();

// CORS設定
const corsOptions = {
  origin: 'https://training-board.com', // 開発中は全てのオリジンを許可
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// ルートパスのハンドラー
app.get('/', (req, res) => {
  res.json({ message: 'トレーニング掲示板APIサーバーが正常に動作しています' });
});

// ヘルスチェックエンドポイント
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/ai', aiRoutes);

// データベース接続
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
      startAutoPostJob().catch(console.error);
    }).catch(error => {
      console.error('AIユーザー作成エラー:', error);
    });
  })
  .catch((error) => {
    console.error('データベース接続エラー:', error);
  });

// Error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`サーバーが起動しました: http://localhost:${PORT}`);
}); 