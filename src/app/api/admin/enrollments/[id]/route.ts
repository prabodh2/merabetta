import { NextResponse } from 'next/server';
import { getEnrollmentById, updateEnrollmentStatus } from '@/lib/enrollmentStore';
import { EnrollmentStatus } from '@/types/enrollment';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Enrollment ID is required' },
        { status: 400 }
      );
    }

    const record = await getEnrollmentById(id);

    if (!record) {
      return NextResponse.json(
        { success: false, error: 'Registration not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      record,
    });
  } catch (error: unknown) {
    console.error('Error fetching enrollment by id:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch enrollment';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Enrollment ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status, adminNotes, reviewedBy, documents } = body;

    const validStatuses: EnrollmentStatus[] = ['submitted', 'approved', 'rejected'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: `Invalid status: ${status}. Must be one of ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    const updated = await updateEnrollmentStatus(id, {
      status,
      adminNotes,
      reviewedBy: reviewedBy || 'Admin',
      documents,
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Enrollment not found to update' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Status successfully updated to ${status}`,
      record: updated,
    });
  } catch (error: unknown) {
    console.error('Error updating enrollment status:', error);
    const message = error instanceof Error ? error.message : 'Failed to update enrollment';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Enrollment ID is required' },
        { status: 400 }
      );
    }

    const { deleteEnrollment } = await import('@/lib/enrollmentStore');
    const deleted = await deleteEnrollment(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Registration not found or could not be deleted' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Registration deleted successfully',
    });
  } catch (error: unknown) {
    console.error('Error deleting enrollment:', error);
    const message = error instanceof Error ? error.message : 'Failed to delete enrollment';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

