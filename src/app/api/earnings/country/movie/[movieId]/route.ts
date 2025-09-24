import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import EarningByCountry from "@/lib/models/EarningByCountry";
import logger from "@/lib/logger";
import mongoose from "mongoose";

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

    logger.info(`[API] Fetching country earnings for movieId: ${movieId}`);

    const results = await EarningByCountry.aggregate([
      {
        $match: {
          movieId: new mongoose.Types.ObjectId(movieId),
          status: "Active",
        },
      },
      {
        $project: {
          _id: 1,
          movieId: 1,
          countryId: 1,
          payment: 1,
          status: 1,
          createdDate: 1,
          updatedDate: 1,
        },
      },
    ]);

    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    logger.error(
      `[API] Error fetching earnings by country for movie: ${errorMessage}`
    );
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
