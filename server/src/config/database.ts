import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    // MongoDBのURIをログに出力（セキュリティのために一部を隠す）
    const mongoUri = process.env.MONGODB_URI || '';
    const visibleUri = mongoUri.includes('@') 
      ? mongoUri.replace(/(mongodb(\+srv)?:\/\/[^:]+:)[^@]+(@.+)/, '$1****$3')
      : 'MongoDB URI not set';
    
    console.log(`MongoDB接続を試行します: ${visibleUri}`);
    
    // 接続オプションを設定
    const options = {
      serverSelectionTimeoutMS: 15000, // サーバー選択タイムアウト: 15秒
      socketTimeoutMS: 30000, // ソケットタイムアウト: 30秒
      connectTimeoutMS: 30000, // 接続タイムアウト: 30秒
    };
    
    const conn = await mongoose.connect(process.env.MONGODB_URI as string, options);
    console.log(`MongoDB接続成功: ${conn.connection.host}`);
    console.log(`データベース名: ${conn.connection.name}`);
    console.log(`接続状態: ${conn.connection.readyState}`);
  } catch (error: unknown) {
    console.error('MongoDBへの接続エラー:');
    if (error instanceof Error) {
      console.error(`エラーメッセージ: ${error.message}`);
      console.error(`エラータイプ: ${error.name}`);
      console.error(`スタックトレース: ${error.stack}`);
    } else {
      console.error('不明なエラー:', error);
    }
    process.exit(1);
  }
};

export default connectDB; 