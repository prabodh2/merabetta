import { NextResponse } from 'next/server';
import { getEnrollments } from '@/lib/enrollmentStore';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';

    const result = await getEnrollments({
      page,
      limit,
      search,
      status,
      sortOrder,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: unknown) {
    console.error('Error fetching admin enrollments:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch enrollments';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
