
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import TopActorEarning from '@/lib/models/TopActorEarning';
import logger from '@/lib/logger';
import mongoose from 'mongoose';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    logger.info(`[API] Fetching top actor earning with ID: ${params.id}`);
    const earning = await TopActorEarning.findById(params.id);
    if (!earning) {
      return NextResponse.json({ success: false, error: 'Earning record not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: earning });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    logger.error(`[API] Error fetching top actor earning ${params.id}: ${errorMessage}`);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const body = await request.json();
    logger.info(`[API] Updating top actor earning with ID: ${params.id}`);
    
    // Ensure movieId is an ObjectId if it's being updated
    if (body.movieId && !mongoose.Types.ObjectId.isValid(body.movieId)) {
       body.movieId = new mongoose.Types.ObjectId(body.movieId);
    }


    const earning = await TopActorEarning.findByIdAndUpdate(params.id, body, { new: true, runValidators: true });
    if (!earning) {
      return NextResponse.json({ success: false, error: 'Earning record not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: earning });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    logger.error(`[API] Error updating top actor earning ${params.id}: ${errorMessage}`);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    logger.info(`[API] Deleting top actor earning with ID: ${params.id}`);
    const deletedEarning = await TopActorEarning.findByIdAndDelete(params.id);
    if (!deletedEarning) {
      return NextResponse.json({ success: false, error: 'Earning record not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    logger.error(`[API] Error deleting top actor earning ${params.id}: ${errorMessage}`);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
