
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import MovieSeries from '@/lib/models/MovieSeries';
import logger from '@/lib/logger';

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    if (!query) {
      return NextResponse.json({ success: false, error: 'Query parameter is required' }, { status: 400 });
    }

    const movies = await MovieSeries.find({
      title: { $regex: query, $options: 'i' }
    })
    .select('title _id')
    .limit(5)
    .lean();

    logger.info(`[API/search] Found ${movies.length} movies for query: "${query}"`);

    return NextResponse.json({
      success: true,
      data: movies,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    logger.error(`[API/search] Error searching for movies: ${errorMessage}`);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
