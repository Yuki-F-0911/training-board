import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './User';
import { IQuestion } from './Question';

export interface IAnswer extends Document {
  content: string;
  author: mongoose.Types.ObjectId;
  question: mongoose.Types.ObjectId;
  upvotes: mongoose.Types.ObjectId[];
  downvotes: mongoose.Types.ObjectId[];
  accepted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const answerSchema = new Schema(
  {
    content: {
      type: String,
      required: [true, '回答内容は必須です'],
      trim: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    question: {
      type: Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
    },
    upvotes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    downvotes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    accepted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// インデックスの作成
answerSchema.index({ content: 'text' });

export const Answer = mongoose.model<IAnswer>('Answer', answerSchema); 