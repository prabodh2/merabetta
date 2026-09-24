import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import crypto from 'crypto';

const globalStore = global as any;
if (!globalStore.otpSessions) globalStore.otpSessions = {};
if (!globalStore.vendorSessions) globalStore.vendorSessions = {};

export async function POST(request: NextRequest) {
  try {
    const { phone, otp } = await request.json();

    if (!phone || !/^\d{10}$/.test(phone) || !otp) {
      return NextResponse.json({ success: false, error: 'Invalid input' }, { status: 400 });
    }

    // Step 1: Verify OTP
    let valid = false;
    let dbAvailable = true;

    try {
      const client = await clientPromise;
      const db = client.db();
      const session = await db.collection('otp_sessions').findOne({ phone, otp, type: 'vendor' });
      if (session && session.expiresAt > new Date()) {
        valid = true;
        await db.collection('otp_sessions').deleteOne({ phone, type: 'vendor' });
      }
    } catch {
      dbAvailable = false;
      const session = globalStore.otpSessions[`vendor_${phone}`];
      if (session && session.otp === otp && session.expiresAt > new Date()) {
        valid = true;
        delete globalStore.otpSessions[`vendor_${phone}`];
      }
    }

    if (!valid) {
      return NextResponse.json({ success: false, error: 'Invalid or expired OTP' }, { status: 400 });
    }

    // Step 2: Check if this phone belongs to an approved enrolled facility
    let vendorData: any = null;

    if (dbAvailable) {
      try {
        const client = await clientPromise;
        const db = client.db('merabetta');

        // Look for an approved enrollment with this contact phone
        const enrollment = await db.collection('old age home registration').findOne({
          $or: [
            { 'fullData.mobileNumber': phone },
            { 'fullData.contactPersonPhone': phone },
            { phone },
          ],
          status: { $in: ['approved', 'active', 'submitted'] },
        });

        if (enrollment) {
          vendorData = {
            id: enrollment._id.toString(),
            phone,
            name: enrollment.fullData?.contactPersonName || enrollment.fullData?.homeName || 'Vendor',
            facilityId: enrollment._id.toString(),
            facilityName: enrollment.fullData?.homeName || 'Senior Living Facility',
            facilityCity: enrollment.fullData?.city || '',
            referenceId: enrollment.referenceId || enrollment._id.toString(),
          };
        }
      } catch (dbErr) {
        console.warn('Vendor enrollment lookup error:', dbErr);
      }
    }

    // Fallback: check sample homes (for dev/demo)
    if (!vendorData) {
      // Allow any valid OTP user to be a demo vendor in dev
      // Map to a sample facility based on phone (just for demo purposes)
      vendorData = {
        id: `vendor_${phone}`,
        phone,
        name: 'Demo Vendor',
        facilityId: 'SAMPLE-001',
        facilityName: 'Anand Ashram Senior Care',
        facilityCity: 'Pune',
        referenceId: 'MB-2024-001',
      };
    }

    // Step 3: Create vendor session token
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    try {
      if (dbAvailable) {
        const client = await clientPromise;
        const db = client.db();
        await db.collection('vendor_sessions').insertOne({
          token,
          vendorId: vendorData.id,
          phone,
          facilityId: vendorData.facilityId,
          referenceId: vendorData.referenceId,
          createdAt: new Date(),
          expiresAt,
        });
      }
    } catch {
      dbAvailable = false;
    }

    globalStore.vendorSessions[token] = {
      token,
      vendorId: vendorData.id,
      phone,
      facilityId: vendorData.facilityId,
      referenceId: vendorData.referenceId,
      vendor: vendorData,
      expiresAt,
    };

    return NextResponse.json({ success: true, token, vendor: vendorData });
  } catch (error) {
    console.error('Vendor verify-otp error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
