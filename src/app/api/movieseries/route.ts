
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import MovieSeries from "@/lib/models/MovieSeries";
import logger from "@/lib/logger";

export async function GET() {
  try {
    await dbConnect();
    logger.info("[API] Fetching all movie series.");
    const movieSeries = await MovieSeries.find({});
    return NextResponse.json({ success: true, data: movieSeries });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    logger.error(`[API] Error fetching movie series: ${errorMessage}`);
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}


export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    logger.info('[API] Creating a new movie series record.');

    // The body should contain all the necessary fields.
    // Mongoose's .create() method will handle creating a new document with a new _id.
    const movie = await MovieSeries.create(body);
    return NextResponse.json({ success: true, data: movie }, { status: 201 });
  } catch (error: any) {
    logger.error(`[API] Error creating movie series: ${error.message}`);
    // Provide more detailed error response for debugging
    if (error.code === 11000) {
       return NextResponse.json({ success: false, error: `Duplicate key error: ${JSON.stringify(error.keyValue)}` }, { status: 409 });
    }
    if (error.name === 'ValidationError') {
      return NextResponse.json({ success: false, error: error.message, details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error.message || 'An unknown error occurred' }, { status: 400 });
  }
}
