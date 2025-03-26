import mongoose, { Schema, Document } from 'mongoose';

export interface IBookmark extends Document {
  user: mongoose.Schema.Types.ObjectId;
  question: mongoose.Schema.Types.ObjectId;
  createdAt: Date;
}

const BookmarkSchema: Schema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
    },
  },
  { timestamps: true }
);

// ユーザーとクエスチョンの組み合わせでユニーク制約
BookmarkSchema.index({ user: 1, question: 1 }, { unique: true });

export const Bookmark = mongoose.model<IBookmark>('Bookmark', BookmarkSchema); 