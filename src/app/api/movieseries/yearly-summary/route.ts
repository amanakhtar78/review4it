import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import MovieSeries from '@/lib/models/MovieSeries';
import logger from '@/lib/logger';

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const zone = searchParams.get('zone');

    if (!year) {
      return NextResponse.json({ success: false, error: 'Year parameter is required' }, { status: 400 });
    }

    const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
    const endDate = new Date(`${year}-12-31T23:59:59.999Z`);
    
    const query: any = {
      movieReleaseDate: {
        $gte: startDate.toISOString(),
        $lte: endDate.toISOString(),
      },
      budget: { $gt: 0 }, // Ensure budget is present to calculate ROI
      earnings: { $exists: true }, // Ensure earnings is present
      type: { $in: ['Movie', 'movie_theater', 'movie_ott'] }
    };
    
    if (zone && zone !== 'All') {
        query.origin = { $regex: new RegExp(zone, 'i') };
    }

    logger.info(`[API/yearly-summary] Fetching summary with query: ${JSON.stringify(query)}`);

    const movies = await MovieSeries.find(query)
      .select('title bannerVertical movieReleaseDate budget earnings origin')
      .lean();

    const moviesWithRoi = movies.map(movie => {
        const roi = movie.budget > 0 ? ((movie.earnings - movie.budget) / movie.budget) * 100 : 0;
        return { ...movie, roi };
    });

    const winners = [...moviesWithRoi]
      .sort((a, b) => b.roi - a.roi)
      .slice(0, 5)
      .map((movie, index) => ({ ...movie, rank: index + 1}));

    const losers = [...moviesWithRoi]
      .sort((a, b) => a.roi - b.roi)
      .slice(0, 5)
      .map((movie, index) => ({ ...movie, rank: index + 1}));

    return NextResponse.json({
      success: true,
      data: { winners, losers },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    logger.error(`[API/yearly-summary] Error: ${errorMessage}`);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
