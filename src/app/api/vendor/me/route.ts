import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

const globalStore = global as any;
if (!globalStore.vendorSessions) globalStore.vendorSessions = {};

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    let sessionData: any = null;

    // Try MongoDB first
    try {
      const client = await clientPromise;
      const db = client.db();
      const session = await db.collection('vendor_sessions').findOne({ token });
      if (session && session.expiresAt > new Date()) {
        // Re-fetch vendor data
        const enrollmentDb = client.db('merabetta');
        let enrollment: any = null;
        try {
          const { ObjectId } = await import('mongodb');
          enrollment = await enrollmentDb.collection('old age home registration').findOne({
            _id: new ObjectId(session.facilityId),
          });
        } catch {
          enrollment = await enrollmentDb.collection('old age home registration').findOne({
            referenceId: session.referenceId,
          });
        }

        sessionData = {
          id: session.vendorId,
          phone: session.phone,
          name: enrollment?.fullData?.contactPersonName || 'Vendor',
          facilityId: session.facilityId,
          facilityName: enrollment?.fullData?.homeName || 'Senior Living Facility',
          facilityCity: enrollment?.fullData?.city || '',
          referenceId: session.referenceId,
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
