import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import crypto from 'crypto';

const DB_NAME = process.env.MONGODB_DB || 'merabetta';

const globalStore = global as unknown as {
  otpSessions: Record<string, Record<string, unknown>>;
};
if (!globalStore.otpSessions) globalStore.otpSessions = {};

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();

    if (!phone || !/^\d{10}$/.test(phone)) {
      return NextResponse.json({ success: false, error: 'Invalid phone number' }, { status: 400 });
    }

    // TODO: Replace with real OTP API once company provides it.
    const otp = '123456';
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 5 * 60 * 1000);

    const sessionData: Record<string, unknown> = {
      phone,
      otp,
      otp_hash: otpHash,
      created_at: now,
      createdAt: now,
      expires_at: expiresAt,
      expiresAt,
      attempts: 0,
      is_used: false,
      type: 'vendor',
    };

    try {
      const client = await clientPromise;
      const db = client.db(DB_NAME);

      // Link vendor_id (ObjectId reference to vendor._id) if vendor exists
      const vendorDoc = await db.collection('vendor').findOne({ phone });
      if (vendorDoc?._id) {
        sessionData.vendor_id = vendorDoc._id;
      }

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
