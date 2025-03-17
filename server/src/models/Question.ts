import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './User';

export interface IQuestion extends Document {
  title: string;
  content: string;
  author: mongoose.Types.ObjectId;
  tags: string[];
  upvotes: mongoose.Types.ObjectId[];
  downvotes: mongoose.Types.ObjectId[];
  views: number;
  isAIGenerated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const questionSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, '質問タイトルは必須です'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, '質問内容は必須です'],
      trim: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
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
  { timestamps: true }
);

// インデックスの作成
questionSchema.index({ title: 'text', content: 'text', tags: 'text' });

export const Question = mongoose.model<IQuestion>('Question', questionSchema); 