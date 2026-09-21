import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

const globalStore = global as any;
if (!globalStore.otpSessions) globalStore.otpSessions = {};

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();

    if (!phone || !/^\d{10}$/.test(phone)) {
      return NextResponse.json({ success: false, error: 'Invalid phone number' }, { status: 400 });
    }

    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ success: false, error: 'OTP service not configured yet. Contact support.' }, { status: 400 });
    }

    const otp = '123456';
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const sessionData = {
      phone,
      otp,
      createdAt: new Date(),
      expiresAt
    };

    try {
      const client = await clientPromise;
      const db = client.db();
      
      await db.collection('otp_sessions').updateOne(
        { phone },
        { $set: sessionData },
        { upsert: true }
      );
    } catch (dbError) {
      // Fallback to in-memory store if MongoDB is unavailable
      globalStore.otpSessions[phone] = sessionData;
    }

    return NextResponse.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
