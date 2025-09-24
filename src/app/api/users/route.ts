
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import logger from '@/lib/logger';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    await dbConnect();
    logger.info('[API] Fetching all users.');
    const users = await User.find({}).select('-password'); // Exclude password from results
    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    logger.error(`[API] Error fetching users: ${errorMessage}`);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    logger.info('[API] Creating a new user.');
    
    const { password, ...userData } = body;

    // The pre-save hook in the User model will handle hashing.
    // We just need to ensure we pass the plain password to the create method.
    const user = await User.create({
      ...userData,
      password: password,
    });

    const userResponse = user.toObject();
    delete userResponse.password;
    
    return NextResponse.json({ success: true, data: userResponse }, { status: 201 });
  } catch (error: any) {
    logger.error(`[API] Error creating user: ${error.message}`);
    // Provide more detailed error response for debugging
    if (error.name === 'ValidationError') {
      return NextResponse.json({ success: false, error: error.message, details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error.message || 'An unknown error occurred' }, { status: 400 });
  }
}
