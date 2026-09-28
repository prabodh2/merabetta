import { NextResponse } from 'next/server';
import { getEnrollmentById, getEnrollments } from '@/lib/enrollmentStore';
import { transformRecordToPublicFacility, PublicFacility, SAMPLE_APPROVED_HOMES } from '@/utils/publicHomes';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Facility ID is required' }, { status: 400 });
    }

    const record = await getEnrollmentById(id);

    let facility: PublicFacility | null = null;
    let rawRecord: any = null;

    if (record) {
      facility = transformRecordToPublicFacility(record);
      rawRecord = {
        _id: record._id,
        referenceId: record.referenceId,
        status: record.status,
        submittedAt: record.submittedAt,
      };
    } else {
      // Check SAMPLE_APPROVED_HOMES by id or referenceId
      const sample = SAMPLE_APPROVED_HOMES.find(
        (h) => h.id === id || h.referenceId.toLowerCase() === id.toLowerCase()
      );
      if (sample) {
        facility = sample;
        rawRecord = {
          _id: sample.id,
          referenceId: sample.referenceId,
          status: 'approved',
          submittedAt: new Date().toISOString(),
        };
      }
    }

    if (!facility) {
      return NextResponse.json({ success: false, error: 'Facility not found' }, { status: 404 });
    }

    // Determine if this facility is one of the 2 free preview facilities
    let isFreePreview = false;
    try {
      const topApproved = await getEnrollments({ status: 'approved', limit: 2 });
      if (topApproved && topApproved.records && topApproved.records.length > 0) {
        const topIds = topApproved.records.flatMap((r) => [
          r._id?.toString()?.toLowerCase(),
          r.referenceId?.toLowerCase(),
        ]);
        isFreePreview = topIds.includes(id.toLowerCase());
      } else {
        const sampleTopIds = SAMPLE_APPROVED_HOMES.slice(0, 2).flatMap((h) => [
          h.id.toLowerCase(),
          h.referenceId.toLowerCase(),
        ]);
        isFreePreview = sampleTopIds.includes(id.toLowerCase());
      }
    } catch {
      const sampleTopIds = SAMPLE_APPROVED_HOMES.slice(0, 2).flatMap((h) => [
        h.id.toLowerCase(),
        h.referenceId.toLowerCase(),
      ]);
      isFreePreview = sampleTopIds.includes(id.toLowerCase());
    }

    return NextResponse.json({
      success: true,
      facility: {
        ...facility,
        isFreePreview,
      },
      isFreePreview,
      rawRecord,
    });
  } catch (error: unknown) {
    console.error('[API /api/homes/[id]] Error fetching facility:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch facility details';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
