import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Admin from "@/lib/models/Admin";
import bcrypt from "bcryptjs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    console.info(`[API] Fetching admin with ID: ${id}`);
    const admin = await Admin.findById(id).select("-password");
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Admin not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: admin });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    console.error(`[API] Error fetching admin ${id}: ${errorMessage}`);
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
    console.info(`[API] Updating admin with ID: ${id}`);

    // If password is being updated, hash it.
    if (body.password) {
      const salt = await bcrypt.genSalt(10);
      body.password = await bcrypt.hash(body.password, salt);
    }

    const admin = await Admin.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    }).select("-password");
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Admin not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: admin });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    console.error(`[API] Error updating admin ${id}: ${errorMessage}`);
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
    console.info(`[API] Deleting admin with ID: ${id}`);
    const deletedAdmin = await Admin.findByIdAndDelete(id);
    if (!deletedAdmin) {
      return NextResponse.json(
        { success: false, error: "Admin not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    console.error(`[API] Error deleting admin ${id}: ${errorMessage}`);
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
