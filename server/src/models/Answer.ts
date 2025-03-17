import mongoose from 'mongoose';
import { IUser } from './User';
import { IQuestion } from './Question';

export interface IAnswer {
  content: string;
  author: mongoose.Types.ObjectId | IUser;
  question: mongoose.Types.ObjectId | IQuestion;
  upvotes: mongoose.Types.ObjectId[];
  downvotes: mongoose.Types.ObjectId[];
  isAccepted: boolean;
  isAIGenerated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const answerSchema = new mongoose.Schema<IAnswer>(
  {
    content: {
      type: String,
      required: [true, '回答内容は必須です'],
      trim: true,
      minlength: [20, '回答内容は20文字以上である必要があります'],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
    },
    upvotes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    downvotes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    isAccepted: {
      type: Boolean,
      default: false,
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
answerSchema.index({ content: 'text' });

export const Answer = mongoose.model<IAnswer>('Answer', answerSchema); 