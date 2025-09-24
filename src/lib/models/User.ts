

import mongoose, { Schema, Document, models, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IQuizHistory extends Document {
    quizId: mongoose.Types.ObjectId;
    score: number;
    answeredDate: Date;
}

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  likedMovies: string[];
  savedMovies: string[];
  dislikedMovies: string[];
  monthlyXP?: number;
  lastLogin?: Date;
  status: 'Active' | 'Inactive';
  deactivationReason?: string;
  lastQuizAnsweredDate?: Date;
  quizHistory: IQuizHistory[];
  comparePassword(password: string): Promise<boolean>;
}

const QuizHistorySchema: Schema<IQuizHistory> = new Schema({
    quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
    score: { type: Number, required: true },
    answeredDate: { type: Date, required: true },
});


const UserSchema: Schema<IUser> = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  likedMovies: { type: [{ type: Schema.Types.ObjectId, ref: 'MovieSeries' }], default: [] },
  savedMovies: { type: [{ type: Schema.Types.ObjectId, ref: 'MovieSeries' }], default: [] },
  dislikedMovies: { type: [{ type: Schema.Types.ObjectId, ref: 'MovieSeries' }], default: [] },
  monthlyXP: { type: Number, default: 0 },
  lastLogin: { type: Date },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  deactivationReason: { type: String },
  lastQuizAnsweredDate: { type: Date },
  quizHistory: { type: [QuizHistorySchema], default: [] },
}, {
  timestamps: { createdAt: 'createdDate', updatedAt: 'updatedDate' }
});

// Pre-save hook to hash password
UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
UserSchema.methods.comparePassword = function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

const User: Model<IUser> = models.User || mongoose.model<IUser>('User', UserSchema, 'users');

export default User;
