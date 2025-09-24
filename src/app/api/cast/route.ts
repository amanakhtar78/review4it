import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import CastMaster from "@/lib/models/CastMaster";

export async function GET() {
  try {
    await dbConnect();
    console.info("[API] Fetching all cast master records.");
    const cast = await CastMaster.find({});
    return NextResponse.json({ success: true, data: cast });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    console.error(`[API] Error fetching cast master records: ${errorMessage}`);
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
    console.info("[API] Creating a new cast master record.");

    // Remove castId if provided (it will be auto-generated)
    const { castId, ...castData } = body;

    const castMember = await CastMaster.create(castData);
    return NextResponse.json(
      { success: true, data: castMember },
      { status: 201 }
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    console.error(`[API] Error creating cast master record: ${errorMessage}`);
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 400 }
    );
  }
}
