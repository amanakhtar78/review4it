
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import logger from '@/lib/logger';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    logger.info(`[API] Fetching user with ID: ${params.id}`);
    const user = await User.findById(params.id).select('-password');
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    logger.error(`[API] Error fetching user ${params.id}: ${errorMessage}`);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const body = await request.json();
    logger.info(`[API] Updating user with ID: ${params.id}`);
    
    const user = await User.findById(params.id);

    if (!user) {
       return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Update fields from request body
    user.username = body.username ?? user.username;
    user.email = body.email ?? user.email; // Note: You might want to prevent email changes or add verification
    user.status = body.status ?? user.status;
    user.monthlyXP = body.monthlyXP ?? user.monthlyXP;
    user.deactivationReason = body.deactivationReason ?? user.deactivationReason;
    
    // The pre-save hook in the User model will hash the password if it is modified.
    if (body.password && body.password.length > 0) {
        user.password = body.password;
    }

    const updatedUser = await user.save();

    const userResponse = updatedUser.toObject();
    delete userResponse.password;

    return NextResponse.json({ success: true, data: userResponse });

  } catch (error: any) {
    logger.error(`[API] Error updating user ${params.id}: ${error.message}`);
    if (error.name === 'ValidationError') {
      return NextResponse.json({ success: false, error: error.message, details: error.errors }, { status: 400 });
    }
     if (error.code === 11000) {
      return NextResponse.json({ success: false, error: `An account with this email or username already exists.` }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    logger.info(`[API] Deleting user with ID: ${params.id}`);
    const deletedUser = await User.findByIdAndDelete(params.id);
    if (!deletedUser) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    logger.error(`[API] Error deleting user ${params.id}: ${errorMessage}`);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
