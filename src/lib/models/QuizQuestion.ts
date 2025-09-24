

import mongoose, { Schema, Document } from 'mongoose';

export interface IOption {
  text?: string;
  imageUrl?: string;
}

export interface IQuizQuestion extends Document {
  questionText: string;
  questionType: 'mcq' | 'mcqWithImage' | 'true_false';
  options: IOption[];
  correctAnswer: number; // index of the correct option
  image?: string; // For true_false or as a general question image
}

export interface IQuiz extends Document {
  title: string;
  date: Date;
  questions: IQuizQuestion[];
  status: 'Active' | 'Inactive';
}

const OptionSchema: Schema<IOption> = new Schema({
  text: { type: String },
  imageUrl: { type: String },
}, { _id: false });

export const QuizQuestionSchema: Schema<IQuizQuestion> = new Schema({
  questionText: { type: String, required: true },
  questionType: { type: String, enum: ['mcq', 'mcqWithImage', 'true_false'], required: true },
  options: { type: [OptionSchema], required: true },
  correctAnswer: { type: Number, required: true },
  image: { type: String },
});

