
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import MovieSeries from "@/lib/models/MovieSeries";
import logger from "@/lib/logger";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    logger.info(`[API] Fetching movie series with ID: ${params.id}`);

    const movie = await MovieSeries.findById(params.id);

    if (!movie) {
      return NextResponse.json(
        { success: false, error: "Movie not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: movie });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    logger.error(`[API] Error fetching movie series ${params.id}: ${errorMessage}`);
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const body = await request.json();
    logger.info(`[API] Updating movie series with ID: ${params.id}`);

    // Ensure all fields, including new ones, are passed for update
    const movie = await MovieSeries.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    });

    if (!movie) {
      return NextResponse.json(
        { success: false, error: "Movie not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: movie });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    logger.error(`[API] Error updating movie series ${params.id}: ${errorMessage}`);
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    logger.info(`[API] Deleting movie series with ID: ${params.id}`);

    // First, try a hard delete, as soft delete might not be what's always intended.
    const deletedMovie = await MovieSeries.findByIdAndDelete(params.id);

    if (!deletedMovie) {
       return NextResponse.json({ success: false, error: "Movie not found" }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    logger.error(`[API] Error deleting movie series ${params.id}: ${errorMessage}`);
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
