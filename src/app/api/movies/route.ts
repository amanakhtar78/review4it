
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Movie from "@/lib/models/Movie";

export async function GET() {
  try {
    await dbConnect();
    console.info("[API] Fetching all movies.");
    const movies = await Movie.find({});
    return NextResponse.json({ success: true, data: movies });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    console.error(`[API] Error fetching movies: ${errorMessage}`);
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
    console.info("[API] Creating a new movie.");

    // This is the safeguard. Delete any potential `_id` or `id` field from the body
    // before passing it to the database. This prevents any duplicate key errors.
    delete body._id;
    delete (body as any).id;

    const movie = await Movie.create(body);
    return NextResponse.json({ success: true, data: movie }, { status: 201 });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    console.error(`[API] Error creating movie: ${errorMessage}`);
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 400 }
    );
  }
}

    