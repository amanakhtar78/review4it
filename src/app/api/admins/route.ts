
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Admin from '@/lib/models/Admin';
import logger from '@/lib/logger';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    await dbConnect();
    logger.info('[API] Fetching all admins.');
    const admins = await Admin.find({}).select('-password');
    return NextResponse.json({ success: true, data: admins });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    logger.error(`[API] Error fetching admins: ${errorMessage}`);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    logger.info('[API] Creating a new admin.');

    const { email, password, ...rest } = body;
    if (!email || !password) {
        return NextResponse.json({ success: false, error: 'Email and password are required' }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const admin = await Admin.create({ email, password: hashedPassword, ...rest });
    
    const adminResponse = admin.toObject();
    delete adminResponse.password;

    return NextResponse.json({ success: true, data: adminResponse }, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    logger.error(`[API] Error creating admin: ${errorMessage}`);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 400 });
  }
}
