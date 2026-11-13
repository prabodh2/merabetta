import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import crypto from 'crypto';

const DB_NAME = process.env.MONGODB_DB || 'merabetta';
const COLLECTION_NAME = process.env.MONGODB_COLLECTION || 'old age home registration';

interface VendorInfo {
  id: string;
  phone: string;
  name: string;
  facilityId: string;
  facilityName: string;
  facilityCity: string;
  referenceId: string;
}

const globalStore = global as unknown as {
  otpSessions: Record<string, { otp: string; expiresAt: Date }>;
  vendorSessions: Record<string, Record<string, unknown>>;
};
if (!globalStore.otpSessions) globalStore.otpSessions = {};
if (!globalStore.vendorSessions) globalStore.vendorSessions = {};

export async function POST(request: NextRequest) {
  try {
    const { phone, otp } = await request.json();

    if (!phone || !/^\d{10}$/.test(phone) || !otp) {
      return NextResponse.json({ success: false, error: 'Invalid input' }, { status: 400 });
    }

    const otpHash = crypto.createHash('sha256').update(String(otp)).digest('hex');

    // Step 1: Verify OTP
    let valid = false;
    let dbAvailable = true;

    try {
      const client = await clientPromise;
      const db = client.db(DB_NAME);
      const session = await db.collection('otp_sessions').findOne({
        phone,
        type: 'vendor',
        is_used: { $ne: true },
      });

      const expiry = session?.expiresAt || session?.expires_at;
      const matchesOtp = session && (session.otp === otp || session.otp_hash === otpHash);

      if (session && matchesOtp && expiry && new Date(expiry) > new Date()) {
        valid = true;
        await db.collection('otp_sessions').updateOne(
          { _id: session._id },
          { $set: { is_used: true }, $inc: { attempts: 1 } }
        );
      } else if (session) {
        await db.collection('otp_sessions').updateOne(
          { _id: session._id },
          { $inc: { attempts: 1 } }
        );
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

    // Step 2: Check `vendor` collection first, then linked `old age home registration`
    let vendorData: VendorInfo | null = null;

    if (dbAvailable) {
      try {
        const client = await clientPromise;
        const db = client.db(DB_NAME);

        // 2a. Primary lookup in `vendor` collection
        const vendorDoc = await db.collection('vendor').findOne({
          phone,
          approval_status: 'approved',
          is_active: { $ne: false },
        });

        if (vendorDoc) {
          let enrollment: Record<string, unknown> | null = null;
          if (vendorDoc.registration_id) {
            enrollment = await db.collection(COLLECTION_NAME).findOne({
              _id: vendorDoc.registration_id,
            });
          }
          if (!enrollment && vendorDoc.registration_reference) {
            enrollment = await db.collection(COLLECTION_NAME).findOne({
              referenceId: vendorDoc.registration_reference,
            });
          }

          const fullData = (enrollment?.fullData || {}) as Record<string, string>;
          const facilityId =
            enrollment?._id?.toString() ||
            vendorDoc.registration_id?.toString() ||
            vendorDoc._id.toString();
          const referenceId = String(
            vendorDoc.registration_reference ||
              enrollment?.referenceId ||
              vendorDoc.user_id ||
              facilityId
          );

          vendorData = {
            id: String(vendorDoc.user_id || vendorDoc._id.toString()),
            phone: String(vendorDoc.phone || phone),
            name: String(
              vendorDoc.vendor_name ||
                fullData.contactPersonName ||
                'Vendor'
            ),
            facilityId,
            facilityName: String(
              vendorDoc.business_name ||
                fullData.homeName ||
                'Senior Living Facility'
            ),
            facilityCity: String(
              vendorDoc.location?.city ||
                fullData.city ||
                ''
            ),
            referenceId,
          };
        } else {
          // 2b. Fallback lookup in `old age home registration` for approved facilities
          const enrollment = await db.collection(COLLECTION_NAME).findOne({
            $or: [
              { 'fullData.mobileNumber': phone },
              { 'fullData.contactPersonPhone': phone },
              { mobileNumber: phone },
              { phone },
            ],
            status: { $in: ['approved', 'active'] },
          });

          if (enrollment) {
            vendorData = {
              id: enrollment._id.toString(),
              phone,
              name:
                enrollment.fullData?.contactPersonName ||
                enrollment.contactPersonName ||
                enrollment.fullData?.homeName ||
                'Vendor',
              facilityId: enrollment._id.toString(),
              facilityName:
                enrollment.fullData?.homeName ||
                enrollment.homeName ||
                'Senior Living Facility',
              facilityCity:
                enrollment.fullData?.city || enrollment.city || '',
              referenceId:
                enrollment.referenceId || enrollment._id.toString(),
            };
          }
        }
      } catch (dbErr) {
        console.warn('Vendor lookup error:', dbErr);
      }
    }

    // Fallback: check sample homes (for dev/demo)
    if (!vendorData) {
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

    // Step 3: Create vendor session token in `merabetta` DB
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    try {
      if (dbAvailable) {
        const client = await clientPromise;
        const db = client.db(DB_NAME);
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
