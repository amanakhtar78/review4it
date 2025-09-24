
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Quiz from '@/lib/models/Quiz';
import logger from '@/lib/logger';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    logger.info(`[API] Fetching quiz with ID: ${params.id}`);
    const quiz = await Quiz.findById(params.id);
    if (!quiz) {
      return NextResponse.json({ success: false, error: 'Quiz not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: quiz });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    logger.error(`[API] Error fetching quiz ${params.id}: ${errorMessage}`);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const body = await request.json();
    logger.info(`[API] Updating quiz with ID: ${params.id}`);
    
    if (body.date) {
        body.date = new Date(body.date);
    }

    const quiz = await Quiz.findByIdAndUpdate(params.id, body, { new: true, runValidators: true });
    if (!quiz) {
      return NextResponse.json({ success: false, error: 'Quiz not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: quiz });
  } catch (error: any) {
    logger.error(`[API] Error updating quiz ${params.id}: ${error.message}`);
     if (error.code === 11000) {
       return NextResponse.json({ success: false, error: `A quiz for this date already exists.` }, { status: 409 });
    }
    if (error.name === 'ValidationError') {
      return NextResponse.json({ success: false, error: error.message, details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    logger.info(`[API] Deleting quiz with ID: ${params.id}`);
    const deletedQuiz = await Quiz.findByIdAndDelete(params.id);
    if (!deletedQuiz) {
      return NextResponse.json({ success: false, error: 'Quiz not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    logger.error(`[API] Error deleting quiz ${params.id}: ${errorMessage}`);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
