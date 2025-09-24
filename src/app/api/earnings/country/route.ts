
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import EarningByCountry from '@/lib/models/EarningByCountry';
import logger from '@/lib/logger';
import mongoose from 'mongoose';

export async function GET() {
  try {
    await dbConnect();
    logger.info('[API] Fetching all earnings by country with movie titles.');
    
    const earnings = await EarningByCountry.aggregate([
      {
        $lookup: {
          from: 'movieseries', // The name of the collection to join with
          localField: 'movieId', // Field from the EarningByCountry collection
          foreignField: '_id', // Field from the movieSeries collection
          as: 'movieDetails' // The output array field
        }
      },
      {
        $unwind: { // Deconstructs the movieDetails array field to output a document for each element
          path: '$movieDetails',
          preserveNullAndEmptyArrays: true // Keep earnings records even if movie is not found
        }
      },
      {
        $project: { // Select the fields to return
          _id: 1,
          movieId: 1,
          countryId: 1,
          payment: 1,
          status: 1,
          createdDate: 1,
          updatedDate: 1,
          movieTitle: '$movieDetails.title' // Get the title from the joined data
        }
      }
    ]);

    return NextResponse.json({ success: true, data: earnings });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    logger.error(`[API] Error fetching earnings by country: ${errorMessage}`);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    logger.info('[API] Creating a new earning by country record.');
    
    // Convert movieId to a valid ObjectId
    if (body.movieId) {
      body.movieId = new mongoose.Types.ObjectId(body.movieId);
    }

    const earning = await EarningByCountry.create(body);
    return NextResponse.json({ success: true, data: earning }, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    logger.error(`[API] Error creating earning by country: ${errorMessage}`);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 400 });
  }
}
