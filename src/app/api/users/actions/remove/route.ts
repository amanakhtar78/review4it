
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import MovieSeries from '@/lib/models/MovieSeries';
import logger from '@/lib/logger';
import mongoose from 'mongoose';

const actionConfig = {
  like: { userField: 'likedMovies', movieField: 'likes' },
  save: { userField: 'savedMovies', movieField: 'saves' },
  dislike: { userField: 'dislikedMovies', movieField: 'dislikes' },
};

export async function POST(request: Request) {
  await dbConnect();
  const session = await mongoose.startSession();

  try {
    const body = await request.json();
    const { userId, movieId, actionType } = body; 

    if (!userId || !movieId || !actionType) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const config = actionConfig[actionType as keyof typeof actionConfig];
    if (!config) {
      return NextResponse.json({ success: false, error: 'Invalid action type' }, { status: 400 });
    }

    let updatedMovie;
    await session.withTransaction(async () => {
      const user = await User.findById(userId).session(session);
      const movie = await MovieSeries.findById(movieId).session(session);

      if (!user || !movie) {
        throw new Error('User or Movie not found');
      }

      const movieObjectId = new mongoose.Types.ObjectId(movieId);
      
      const userList = (user[config.userField as keyof typeof user] as mongoose.Types.ObjectId[]) || [];
      const isCurrentlySet = userList.some(id => id.toString() === movieId);

      // Only process the action if the movie is currently in the user's list.
      if (isCurrentlySet) {
        // Remove from user's list and decrement movie counter
        await User.updateOne(
          { _id: user._id }, 
          { $pull: { [config.userField]: movieObjectId } }, 
          { session }
        );

        // Ensure we don't decrement below zero
        if ((movie[config.movieField as keyof typeof movie] || 0) > 0) {
            await MovieSeries.updateOne(
            { _id: movieObjectId }, 
            { $inc: { [config.movieField]: -1 } }, 
            { session }
            );
        }
      }
      
      // Fetch the latest movie state to return
      updatedMovie = await MovieSeries.findById(movieId).lean().session(session);
    });

    if (!updatedMovie) {
        throw new Error("Could not retrieve updated movie.");
    }

    return NextResponse.json({ success: true, data: updatedMovie });

  } catch (error: any) {
    logger.error(`[API/users/actions/remove] Error: ${error.message}`);
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  } finally {
    await session.endSession();
  }
}
