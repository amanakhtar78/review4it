
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import TopActorEarning from '@/lib/models/TopActorEarning';
import logger from '@/lib/logger';
import mongoose from 'mongoose';

export async function GET() {
  try {
    await dbConnect();
    logger.info('[API] Fetching all top actor earnings.');
    const earnings = await TopActorEarning.find({});
    return NextResponse.json({ success: true, data: earnings });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    logger.error(`[API] Error fetching top actor earnings: ${errorMessage}`);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    logger.info('[API] Creating a new top actor earning record.');

    // Convert movieId to a valid ObjectId
    if (body.movieId) {
      body.movieId = new mongoose.Types.ObjectId(body.movieId);
    }
    
    const earning = await TopActorEarning.create(body);
    return NextResponse.json({ success: true, data: earning }, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    logger.error(`[API] Error creating top actor earning: ${errorMessage}`);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 400 });
  }
}
