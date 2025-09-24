

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Quiz from '@/lib/models/Quiz';
import logger from '@/lib/logger';

export async function GET() {
  try {
    await dbConnect();
    logger.info('[API] Fetching all quizzes.');
    const quizzes = await Quiz.find({}).sort({ date: -1 });
    return NextResponse.json({ success: true, data: quizzes });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    logger.error(`[API] Error fetching quizzes: ${errorMessage}`);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    logger.info('[API] Creating a new quiz.');

    // Convert date string to Date object
    if (body.date) {
        body.date = new Date(body.date);
    }
    
    const quiz = await Quiz.create(body);
    return NextResponse.json({ success: true, data: quiz }, { status: 201 });
  } catch (error: any) {
    logger.error(`[API] Error creating quiz: ${error.message}`);
    if (error.code === 11000) {
       return NextResponse.json({ success: false, error: `A quiz for this date already exists.` }, { status: 409 });
    }
    if (error.name === 'ValidationError') {
      return NextResponse.json({ success: false, error: error.message, details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error.message || 'An unknown error occurred' }, { status: 400 });
  }
}
