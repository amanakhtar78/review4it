
import mongoose, { Schema, Document, models, Model } from 'mongoose';
import { IQuizQuestion, QuizQuestionSchema } from './QuizQuestion';

export interface IQuiz extends Document {
  title: string;
  date: Date;
  questions: IQuizQuestion[];
  status: 'Active' | 'Inactive';
  category: 'Bollywood' | 'Hollywood' | 'Tollywood' | 'General';
}

const QuizSchema: Schema<IQuiz> = new Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true, unique: false }, // Removed unique constraint to allow multiple per day
  questions: { type: [QuizQuestionSchema], required: true },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  category: { type: String, enum: ['Bollywood', 'Hollywood', 'Tollywood', 'General'], default: 'General' },
}, {
  timestamps: { createdAt: 'createdDate', updatedAt: 'updatedDate' }
});

// Add a compound index to ensure one quiz per category per day
QuizSchema.index({ date: 1, category: 1 }, { unique: true });


const Quiz: Model<IQuiz> = models.Quiz || mongoose.model<IQuiz>('Quiz', QuizSchema, 'quizzes');

export default Quiz;
