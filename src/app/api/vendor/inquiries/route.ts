import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { SAMPLE_APPROVED_HOMES } from '@/utils/publicHomes';

const globalStore = global as any;
if (!globalStore.vendorSessions) globalStore.vendorSessions = {};

async function getVendorFromToken(token: string) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const session = await db.collection('vendor_sessions').findOne({ token });
    if (session && session.expiresAt > new Date()) return session;
  } catch {}
  const session = globalStore.vendorSessions[token];
  if (session && session.expiresAt > new Date()) return session;
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const session = await getVendorFromToken(token);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { referenceId, facilityId } = session;

    // Fetch inquiries for this facility
    let inquiries: any[] = [];

    try {
      const client = await clientPromise;
      const db = client.db('merabetta');
      const raw = await db
        .collection('inquiries')
        .find({
          $or: [
            { facilityId },
            { facilityReferenceId: referenceId },
          ],
        })
        .sort({ createdAt: -1 })
        .limit(100)
        .toArray();
      inquiries = raw.map((i) => ({ ...i, _id: i._id.toString() }));
    } catch {
      // No MongoDB — return sample inquiries for demo
      inquiries = [
        {
          _id: 'demo-1',
          referenceCode: 'BK-VISIT-100001',
          type: 'visit',
          fullName: 'Ramesh Kulkarni',
          phoneNumber: '9876543210',
          preferredDate: '2026-09-28',
          timeSlot: 'Morning (10 AM - 1 PM)',
          residentCondition: 'Assisted Living',
          notes: 'Looking for mother, needs ground floor room.',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          status: 'new',
        },
        {
          _id: 'demo-2',
          referenceCode: 'BK-VISIT-100002',
          type: 'bed_reservation',
          fullName: 'Sunita Sharma',
          phoneNumber: '9123456789',
          preferredDate: '2026-09-30',
          timeSlot: 'Afternoon (2 PM - 5 PM)',
          residentCondition: 'Bedridden / ICU',
          notes: 'Father needs 24/7 nursing support.',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          status: 'new',
        },
        {
          _id: 'demo-3',
          referenceCode: 'BK-VISIT-100003',
          type: 'visit',
          fullName: 'Vikram Patil',
          phoneNumber: '9900112233',
          preferredDate: '2026-09-25',
          timeSlot: 'Morning (10 AM - 1 PM)',
          residentCondition: 'Independent / Ambulatory',
          notes: '',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'responded',
        },
      ];
    }

    return NextResponse.json({ success: true, inquiries });
  } catch (error) {
    console.error('Vendor inquiries error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const session = await getVendorFromToken(token);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { inquiryId, status } = await request.json();
    const validStatuses = ['new', 'responded', 'done', 'no_show'];
    if (!inquiryId || !validStatuses.includes(status)) {
      return NextResponse.json({ success: false, error: 'Invalid input' }, { status: 400 });
    }

    try {
      const client = await clientPromise;
      const db = client.db('merabetta');
      const { ObjectId } = await import('mongodb');
      await db.collection('inquiries').updateOne(
        { _id: new ObjectId(inquiryId) },
        { $set: { status, updatedAt: new Date().toISOString() } }
      );
    } catch {
      // In-memory — just acknowledge
    }

    return NextResponse.json({ success: true, message: 'Status updated' });
  } catch (error) {
    console.error('Vendor inquiries PATCH error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
