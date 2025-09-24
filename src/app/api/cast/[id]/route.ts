import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import CastMaster from "@/lib/models/CastMaster";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    console.info(`[API] Fetching cast master record with ID: ${id}`);
    // Assuming ID is the custom castId, not the mongo _id
    const castMember = await CastMaster.findOne({ castId: id });
    if (!castMember) {
      return NextResponse.json(
        { success: false, error: "Cast member not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: castMember });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    console.error(
      `[API] Error fetching cast master record ${id}: ${errorMessage}`
    );
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
    console.info(`[API] Updating cast master record with ID: ${id}`);

    // Try to find by MongoDB _id first, then by castId
    let castMember = await CastMaster.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!castMember) {
      // If not found by _id, try by castId
      castMember = await CastMaster.findOneAndUpdate({ castId: id }, body, {
        new: true,
        runValidators: true,
      });
    }

    if (!castMember) {
      return NextResponse.json(
        { success: false, error: "Cast member not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: castMember });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    console.error(
      `[API] Error updating cast master record ${id}: ${errorMessage}`
    );
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
    console.info(`[API] Deleting cast master record with ID: ${id}`);

    // Try to find by MongoDB _id first, then by castId
    let deletedCastMember = await CastMaster.findByIdAndUpdate(
      id,
      { status: "Inactive" },
      { new: true }
    );

    if (!deletedCastMember) {
      // If not found by _id, try by castId
      deletedCastMember = await CastMaster.findOneAndUpdate(
        { castId: id },
        { status: "Inactive" },
        { new: true }
      );
    }

    if (!deletedCastMember) {
      return NextResponse.json(
        { success: false, error: "Cast member not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    console.error(
      `[API] Error deleting cast master record ${id}: ${errorMessage}`
    );
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
