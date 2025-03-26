import mongoose, { Schema, models } from 'mongoose';

const RatingSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['question', 'answer'],
      required: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: 'type',
    },
    value: {
      type: Number,
      enum: [-1, 1], // -1 for downvote, 1 for upvote
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// インデックスを作成して一意の評価を保証
RatingSchema.index({ user: 1, type: 1, targetId: 1 }, { unique: true });

const Rating = models.Rating || mongoose.model('Rating', RatingSchema);

export default Rating; 