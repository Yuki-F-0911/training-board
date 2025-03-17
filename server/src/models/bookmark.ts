import mongoose from 'mongoose';

export interface IBookmark extends mongoose.Document {
  user: mongoose.Types.ObjectId;
  question: mongoose.Types.ObjectId;
  createdAt: Date;
}

const bookmarkSchema = new mongoose.Schema({
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// ユーザーと質問の組み合わせでユニークにする
bookmarkSchema.index({ user: 1, question: 1 }, { unique: true });

export default mongoose.model<IBookmark>('Bookmark', bookmarkSchema); 