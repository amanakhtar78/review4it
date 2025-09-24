
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Admin from "@/lib/models/Admin";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ||
    "your-default-secret-key-that-is-at-least-32-chars-long"
);

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { email, password } = await request.json();

    if (!email || !password) {
      console.warn("[Login API] Bad Request: Email or password missing.");
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    const admin = await Admin.findOne({ email });

    if (!admin) {
      console.warn(
        `[Login API] Auth failed: Admin not found for email: ${email}`
      );
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isPasswordMatch = await bcrypt.compare(password, admin.password);

    if (!isPasswordMatch) {
      console.warn(
        `[Login API] Auth failed: Invalid password for email: ${email}`
      );
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Create JWT
    const token = await new SignJWT({
      userId: admin._id,
      username: admin.username,
      email: admin.email,
      rights: admin.rights,
      isAdmin: true, // Add a flag to distinguish admin tokens
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1h") // Token expires in 1 hour
      .sign(JWT_SECRET);

    console.info(`[Login API] Login successful for admin: ${email}`);
    return NextResponse.json({ success: true, token });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    console.error(`[Login API] Server error: ${errorMessage}`);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
