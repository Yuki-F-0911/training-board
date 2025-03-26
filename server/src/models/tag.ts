import mongoose from 'mongoose';

export interface ITag extends mongoose.Document {
  name: string;
  description: string;
  questionsCount: number;
  createdAt: Date;
}

const tagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  questionsCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<ITag>('Tag', tagSchema); 