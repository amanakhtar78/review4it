
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import EarningByCountry from '@/lib/models/EarningByCountry';
import logger from '@/lib/logger';
import mongoose from 'mongoose';


export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    logger.info(`[API] Fetching earning by country with ID: ${params.id}`);
    const earning = await EarningByCountry.findById(params.id);
    if (!earning) {
      return NextResponse.json({ success: false, error: 'Earning record not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: earning });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    logger.error(`[API] Error fetching earning by country ${params.id}: ${errorMessage}`);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const body = await request.json();
    logger.info(`[API] Updating earning by country with ID: ${params.id}`);
    
    // Ensure movieId is an ObjectId if it's being updated
    if (body.movieId && !mongoose.Types.ObjectId.isValid(body.movieId)) {
      body.movieId = new mongoose.Types.ObjectId(body.movieId);
    }

    const earning = await EarningByCountry.findByIdAndUpdate(params.id, body, { new: true, runValidators: true });
    if (!earning) {
      return NextResponse.json({ success: false, error: 'Earning record not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: earning });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    logger.error(`[API] Error updating earning by country ${params.id}: ${errorMessage}`);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    logger.info(`[API] Deleting earning by country with ID: ${params.id}`);
    const deletedEarning = await EarningByCountry.findByIdAndDelete(params.id);
    if (!deletedEarning) {
      return NextResponse.json({ success: false, error: 'Earning record not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    logger.error(`[API] Error deleting earning by country ${params.id}: ${errorMessage}`);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
