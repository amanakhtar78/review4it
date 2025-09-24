
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import MovieSeries from '@/lib/models/MovieSeries';
import logger from '@/lib/logger';

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'Movie';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const languages = searchParams.get('languages')?.split(',');
    const skip = (page - 1) * limit;

    const today = new Date().toISOString();

    const query: any = {
      movieReleaseDate: { $gte: today },
    };
    
    if (languages && languages.length > 0 && !languages.includes('All')) {
      query.languagesAvailable = { $in: languages };
    }

    if (type === 'Movie') {
        query.type = { $in: ['Movie', 'movie_theater', 'movie_ott'] };
    } else { 
        query.type = 'Web Series';
    }


    logger.info(`[API/upcoming] Fetching upcoming content with query: ${JSON.stringify(query)}`);

    const movies = await MovieSeries.find(query)
      .sort({ movieReleaseDate: 1 })
      .skip(skip)
      .limit(limit)
      .select('title bannerVertical movieReleaseDate category languagesAvailable type likes saves dislikes')
      .lean();

    const total = await MovieSeries.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: movies,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    logger.error(`[API/upcoming] Error fetching upcoming content: ${errorMessage}`);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
