
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import logger from '@/lib/logger';

export async function GET() {
  try {
    await dbConnect();
    logger.info('[API] Fetching user leaderboard.');
    
    const topUsers = await User.find({})
      .sort({ monthlyXP: -1 })
      .limit(10)
      .select('username monthlyXP'); // Only select needed fields

    return NextResponse.json({ success: true, data: topUsers });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    logger.error(`[API] Error fetching user leaderboard: ${errorMessage}`);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
