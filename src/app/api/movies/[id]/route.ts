
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Movie from "@/lib/models/Movie";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    console.info(`[API] Fetching movie with ID: ${id}`);

    const movie = await Movie.findById(id);

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
    console.error(`[API] Error fetching movie ${id}: ${errorMessage}`);
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const body = await request.json();
    const { id } = await params;
    console.info(`[API] Updating movie with ID: ${id}`);

    const movie = await Movie.findByIdAndUpdate(id, body, {
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
    console.error(`[API] Error updating movie ${id}: ${errorMessage}`);
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    console.info(`[API] Deleting movie with ID: ${id}`);

    const deletedMovie = await Movie.findByIdAndUpdate(
      id,
      { status: "Inactive" },
      { new: true }
    );

    if (!deletedMovie) {
      return NextResponse.json(
        { success: false, error: "Movie not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    console.error(`[API] Error deleting movie ${id}: ${errorMessage}`);
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
