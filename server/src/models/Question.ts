import mongoose from 'mongoose';
import { IUser } from './User';

export interface IQuestion {
  title: string;
  content: string;
  author: mongoose.Types.ObjectId | IUser;
  tags: string[];
  upvotes: mongoose.Types.ObjectId[];
  downvotes: mongoose.Types.ObjectId[];
  views: number;
  isAIGenerated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const questionSchema = new mongoose.Schema<IQuestion>(
  {
    title: {
      type: String,
      required: [true, 'タイトルは必須です'],
      trim: true,
      minlength: [10, 'タイトルは10文字以上である必要があります'],
      maxlength: [200, 'タイトルは200文字以下である必要があります'],
    },
    content: {
      type: String,
      required: [true, '質問内容は必須です'],
      trim: true,
      minlength: [20, '質問内容は20文字以上である必要があります'],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tags: [{
      type: String,
      trim: true,
    }],
    upvotes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    downvotes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    views: {
      type: Number,
      default: 0,
    },
    isAIGenerated: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// インデックスの作成
questionSchema.index({ title: 'text', content: 'text', tags: 'text' });

export const Question = mongoose.model<IQuestion>('Question', questionSchema); 