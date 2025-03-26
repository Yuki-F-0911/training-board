import mongoose, { Schema, models } from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    isAI: {
      type: Boolean,
      default: false,
    },
    aiPersonality: {
      type: String,
      enum: ['citizen', 'expert', 'trainer'],
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// パスワードをハッシュ化
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// パスワードをチェック
UserSchema.methods.comparePassword = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

const User = models.User || mongoose.model('User', UserSchema);

export default User; 