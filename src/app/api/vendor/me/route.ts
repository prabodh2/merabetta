import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

const DB_NAME = process.env.MONGODB_DB || 'merabetta';
const COLLECTION_NAME = process.env.MONGODB_COLLECTION || 'old age home registration';

const globalStore = global as unknown as {
  vendorSessions: Record<string, { expiresAt: Date; vendor: Record<string, unknown> }>;
};
if (!globalStore.vendorSessions) globalStore.vendorSessions = {};

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    let sessionData: Record<string, unknown> | null = null;

    // Try MongoDB first
    try {
      const client = await clientPromise;
      const db = client.db(DB_NAME);
      const session = await db.collection('vendor_sessions').findOne({ token });
      if (session && session.expiresAt > new Date()) {
        // Check `vendor` collection and `old age home registration`
        const vendorDoc = await db.collection('vendor').findOne({
          $or: [
            { user_id: session.vendorId },
            { registration_reference: session.referenceId },
            { phone: session.phone },
          ],
        });

        let enrollment: Record<string, unknown> | null = null;
        try {
          const { ObjectId } = await import('mongodb');
          const facId = vendorDoc?.registration_id || session.facilityId;
          if (ObjectId.isValid(facId)) {
            enrollment = await db.collection(COLLECTION_NAME).findOne({
              _id: new ObjectId(facId),
            });
          }
        } catch {
          // ignore ObjectId parse error
        }

        if (!enrollment && session.referenceId) {
          enrollment = await db.collection(COLLECTION_NAME).findOne({
            referenceId: session.referenceId,
          });
        }

        const fullData = (enrollment?.fullData || {}) as Record<string, string>;

        sessionData = {
          id: vendorDoc?.user_id || session.vendorId,
          phone: vendorDoc?.phone || session.phone,
          name:
            vendorDoc?.vendor_name ||
            fullData.contactPersonName ||
            'Vendor',
          facilityId:
            enrollment?._id?.toString() ||
            vendorDoc?.registration_id?.toString() ||
            session.facilityId,
          facilityName:
            vendorDoc?.business_name ||
            fullData.homeName ||
            'Senior Living Facility',
          facilityCity:
            vendorDoc?.location?.city ||
            fullData.city ||
            '',
          referenceId:
            vendorDoc?.registration_reference ||
            enrollment?.referenceId ||
            session.referenceId,
        };
      }
    } catch {
      // Fallback to in-memory
      const session = globalStore.vendorSessions[token];
      if (session && session.expiresAt > new Date()) {
        sessionData = session.vendor;
      }
    }

    if (!sessionData) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ success: true, vendor: sessionData });
  } catch (error) {
    console.error('Vendor me error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
