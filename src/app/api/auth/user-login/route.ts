
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/lib/models/User";
import { SignJWT } from "jose";
import logger from "@/lib/logger";
import { isToday } from 'date-fns';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ||
    "your-default-secret-key-that-is-at-least-32-chars-long"
);

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });

    if (!user) {
        logger.warn(`[User Login] Auth failed: User not found for email: ${email}`);
        return NextResponse.json(
            { success: false, error: "Invalid credentials" },
            { status: 401 }
        );
    }

    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {       
        logger.warn(`[User Login] Auth failed: Invalid password for email: ${email}`);
        return NextResponse.json(
            { success: false, error: "Invalid credentials" },
            { status: 401 }
        );
    }
    
    let loginStreakAwarded = false;
    // Check for daily login streak. isToday is from date-fns which is reliable.
    if (!user.lastLogin || !isToday(new Date(user.lastLogin))) {
        user.monthlyXP = (user.monthlyXP || 0) + 5; // Award 5 XP for the first login of the day.
        loginStreakAwarded = true;
    }
    
    user.lastLogin = new Date();
    await user.save();


    // Create JWT for user
    const token = await new SignJWT({
      userId: user._id,
      username: user.username,
      email: user.email,
      isAdmin: false,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h") // User token can last longer
      .sign(JWT_SECRET);
    
    logger.info(`[User Login] Login successful for user: ${email}`);
    return NextResponse.json({ success: true, token, loginStreakAwarded });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    logger.error(`[User Login API] Server error: ${errorMessage}`);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
