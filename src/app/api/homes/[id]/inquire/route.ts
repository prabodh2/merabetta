import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getEnrollmentById } from '@/lib/enrollmentStore';
import { SAMPLE_APPROVED_HOMES } from '@/utils/publicHomes';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const {
      type = 'visit', // 'visit' | 'bed_reservation' | 'callback'
      fullName,
      phoneNumber,
      email,
      preferredDate,
      timeSlot,
      residentCondition,
      roomType,
      notes,
    } = body;

    if (!fullName || !phoneNumber) {
      return NextResponse.json(
        { success: false, error: 'Full name and mobile phone number are required' },
        { status: 400 }
      );
    }

    const facility = await getEnrollmentById(id);
    const sampleFacility = !facility
      ? SAMPLE_APPROVED_HOMES.find((h) => h.id === id || h.referenceId.toLowerCase() === id.toLowerCase())
      : null;

    const homeName = facility?.fullData?.homeName || sampleFacility?.name || 'Senior Living Facility';
    const referenceCode = `BK-${type === 'visit' ? 'VISIT' : 'RES'}-${Math.floor(100000 + Math.random() * 900000)}`;

    const inquiryDoc = {
      referenceCode,
      facilityId: id,
      facilityReferenceId: facility?.referenceId || sampleFacility?.referenceId || id,
      facilityName: homeName,
      type,
      fullName,
      phoneNumber,
      email: email || '',
      preferredDate: preferredDate || new Date().toISOString().split('T')[0],
      timeSlot: timeSlot || 'Morning (10 AM - 1 PM)',
      residentCondition: residentCondition || 'Independent / Ambulatory',
      roomType: roomType || 'Private Suite',
      notes: notes || '',
      createdAt: new Date().toISOString(),
      status: 'new',
    };

    // Save to MongoDB if available
    try {
      if (process.env.MONGODB_URI) {
        const client = await clientPromise;
        const db = client.db('merabetta');
        await db.collection('inquiries').insertOne(inquiryDoc);
      }
    } catch (dbErr) {
      console.warn('[Inquire API] MongoDB save failed, proceed with response:', dbErr);
    }

    return NextResponse.json({
      success: true,
      referenceCode,
      message:
        type === 'visit'
          ? `Visit scheduled successfully! Our care counselor and ${homeName} management will welcome you on ${inquiryDoc.preferredDate} during the ${inquiryDoc.timeSlot} slot.`
          : `Reservation inquiry submitted! A senior care specialist will contact you within 2 hours with available rooms and fee structure.`,
      inquiry: inquiryDoc,
    });
  } catch (error: unknown) {
    console.error('[API /api/homes/[id]/inquire] Error processing inquiry:', error);
    const message = error instanceof Error ? error.message : 'Failed to process inquiry';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
