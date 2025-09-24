import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import TopActorEarning from "@/lib/models/TopActorEarning";
import logger from "@/lib/logger";
import mongoose from "mongoose";

// GET /api/actors/earnings/movie/[movieId]
// Returns Active actor earnings for the movie with actor names joined from 'cast'
export async function GET(
  _request: Request,
  { params }: { params: { movieId: string } }
) {
  try {
    await dbConnect();
    const { movieId } = params;

    if (!mongoose.Types.ObjectId.isValid(movieId)) {
      return NextResponse.json(
        { success: false, error: "Invalid movieId" },
        { status: 400 }
      );
    }

    logger.info(`[API] Fetching top actor earnings for movieId: ${movieId}`);

    const results = await TopActorEarning.aggregate([
      {
        $match: {
          movieId: new mongoose.Types.ObjectId(movieId),
          status: "Active",
        },
      },
      // actorId is a string referencing cast._id (ObjectId stored as string). Convert and lookup.
      { $addFields: { actorObjectId: { $toObjectId: "$actorId" } } },
      {
        $lookup: {
          from: "cast",
          localField: "actorObjectId",
          foreignField: "_id",
          as: "actor",
        },
      },
      { $unwind: { path: "$actor", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          movieId: 1,
          actorId: 1,
          payment: 1,
          status: 1,
          createdDate: 1,
          updatedDate: 1,
          actorName: "$actor.castName",
          actorImageUrl: "$actor.imageUrl",
        },
      },
    ]);

    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    logger.error(
      `[API] Error fetching top actor earnings by movie: ${errorMessage}`
    );
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
