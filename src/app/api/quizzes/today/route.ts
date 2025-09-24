
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Quiz from '@/lib/models/Quiz';
import logger from '@/lib/logger';
import { startOfDay, endOfDay } from 'date-fns';

export async function GET(request: Request) {
  try {
    await dbConnect();

    const today = new Date();
    const startOfToday = startOfDay(today);
    const endOfToday = endOfDay(today);

    logger.info(`[API/quizzes/today] Fetching all active quizzes for date between: ${startOfToday.toISOString()} and ${endOfToday.toISOString()}`);
    
    // Select all fields except the correct answers to avoid exposing them to the client before submission
    const quizzes = await Quiz.find({
      date: {
        $gte: startOfToday,
        $lte: endOfToday
      },
      status: 'Active'
    }).select('-questions.correctAnswer').lean();

    if (!quizzes || quizzes.length === 0) {
      return NextResponse.json({ success: true, data: [] }); // Return empty array if no quizzes found
    }

    return NextResponse.json({ success: true, data: quizzes });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    logger.error(`[API/quizzes/today] Error: ${errorMessage}`);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
