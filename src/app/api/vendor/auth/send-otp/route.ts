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

    // TODO: Replace with real OTP API once company provides it.
    const otp = '123456';
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const sessionData = { phone, otp, createdAt: new Date(), expiresAt, type: 'vendor' };

    try {
      const client = await clientPromise;
      const db = client.db();
      await db.collection('otp_sessions').updateOne(
        { phone, type: 'vendor' },
        { $set: sessionData },
        { upsert: true }
      );
    } catch {
      globalStore.otpSessions[`vendor_${phone}`] = sessionData;
    }

    return NextResponse.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Vendor send-otp error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
