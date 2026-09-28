/**
 * POST /api/search — Generic Search API
 *
 * Accepts structured search requests and returns paginated results.
 * Currently configured for old-age-home search, but the underlying
 * SearchService is collection-agnostic.
 *
 * Request body:
 * {
 *   "query": "Panvel",
 *   "fields": ["city", "address"],
 *   "filters": { "services": ["Nursing Care"], "price": { "max": 20000 } },
 *   "sort": { "field": "price", "order": "asc" },
 *   "page": 1,
 *   "limit": 20
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "data": [ ...PublicFacility[] ],
 *   "pagination": { "page": 1, "limit": 20, "total": 42, "totalPages": 3 },
 *   "search": { "query": "Panvel", "fields": ["city","address"], "appliedFilters": {} },
 *   "availableCities": ["Mumbai","Pune","Thane"]
 * }
 */

import { NextResponse } from 'next/server';
import { SearchService } from '@/lib/search/SearchService';
import { OLD_AGE_HOME_SEARCH_CONFIG } from '@/lib/search/SearchConfig';
import { SearchRequest } from '@/lib/search/types';
import {
  transformRecordToPublicFacility,
  PublicFacility,
  SAMPLE_APPROVED_HOMES,
} from '@/utils/publicHomes';
import { EnrollmentRecord, EnrollmentStatus, EnrollmentFormData } from '@/types/enrollment';

// Singleton search service for old age homes
const searchService = new SearchService(OLD_AGE_HOME_SEARCH_CONFIG);

export async function POST(request: Request) {
  try {
    // Parse request body
    let body: SearchRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    // Execute search via the generic SearchService
    const result = await searchService.search(body);

    // Transform raw MongoDB documents → PublicFacility objects
    let facilities: PublicFacility[];
    let totalCount = 0;

    if (result.success && result.data && result.data.length > 0) {
      facilities = result.data.map((doc, i) => {
        const record = rawDocToEnrollmentRecord(doc as Record<string, unknown>);
        return transformRecordToPublicFacility(record, i);
      });
      totalCount = result.pagination.total;
    } else {
      // Fallback to sample data when database is offline, empty, or encountered an error
      // (development/demo resilience)
      facilities = filterSampleHomes(body);
      totalCount = facilities.length;
    }

    // Collect available cities for filter dropdown
    let availableCities: string[];
    try {
      availableCities = await searchService.getDistinctValues('city');
    } catch {
      availableCities = [];
    }

    if (availableCities.length === 0) {
      availableCities = [
        ...new Set(facilities.map((f) => f.city).filter(Boolean)),
      ].sort();
    }

    if (availableCities.length === 0) {
      availableCities = ['Mumbai', 'Pune', 'Thane', 'Nashik', 'Navi Mumbai'];
    }

    const page = body.page || 1;
    const limit = body.limit || 20;

    return NextResponse.json({
      success: true,
      data: facilities,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.max(1, Math.ceil(totalCount / limit)),
      },
      search: result.search,
      availableCities,
    });
  } catch (error: unknown) {
    console.error('[API /api/search] Error:', error);
    const message =
      error instanceof Error
        ? error.message
        : 'Search failed unexpectedly';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

// Also support GET for simple searches
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Map GET query params to a SearchRequest
    const body: SearchRequest = {
      query: searchParams.get('q') || searchParams.get('query') || '',
      page: parseInt(searchParams.get('page') || '1', 10),
      limit: parseInt(searchParams.get('limit') || '20', 10),
    };

    // Parse fields
    const fieldsParam = searchParams.get('fields');
    if (fieldsParam) {
      body.fields = fieldsParam.split(',').map((f) => f.trim());
    }

    // Parse sort
    const sortField = searchParams.get('sortBy') || searchParams.get('sort');
    if (sortField) {
      body.sort = {
        field: sortField,
        order:
          (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
      };
    }

    // Parse common filters from query params
    const filters: Record<string, unknown> = {};
    const city = searchParams.get('city');
    if (city && city !== 'all') filters.city = city;

    const careType = searchParams.get('careType');
    if (careType && careType !== 'all') {
      const careMap: Record<string, string[]> = {
        assisted: ['Assisted Living'],
        palliative: ['Palliative Care'],
        independent: ['Independent Living'],
        dementia: ['Dementia Care'],
        hospital: ['Home Hospital'],
      };
      if (careMap[careType]) {
        filters.services = careMap[careType];
      }
    }

    const maxPrice = parseInt(searchParams.get('maxPrice') || '0', 10);
    if (maxPrice > 0) {
      filters.price = { max: maxPrice };
    }

    if (Object.keys(filters).length > 0) {
      body.filters = filters;
    }

    // Delegate to POST handler logic
    const result = await searchService.search(body);

    let facilities: PublicFacility[];
    if (result.data.length > 0) {
      facilities = result.data.map((doc, i) => {
        const record = rawDocToEnrollmentRecord(doc as Record<string, unknown>);
        return transformRecordToPublicFacility(record, i);
      });
    } else if (result.pagination.total === 0) {
      facilities = filterSampleHomes(body);
    } else {
      facilities = [];
    }

    let availableCities: string[];
    try {
      availableCities = await searchService.getDistinctValues('city');
    } catch {
      availableCities = [];
    }
    if (availableCities.length === 0) {
      availableCities = [
        ...new Set(facilities.map((f) => f.city).filter(Boolean)),
      ].sort();
    }
    if (availableCities.length === 0) {
      availableCities = ['Mumbai', 'Pune', 'Thane', 'Nashik', 'Navi Mumbai'];
    }

    return NextResponse.json({
      success: true,
      data: facilities,
      total: result.pagination.total || facilities.length,
      facilities, // backward compat with existing frontend
      pagination: result.pagination,
      search: result.search,
      availableCities,
    });
  } catch (error: unknown) {
    console.error('[API /api/search GET] Error:', error);
    const message =
      error instanceof Error ? error.message : 'Search failed';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Convert a raw MongoDB document into the EnrollmentRecord shape
 * expected by transformRecordToPublicFacility.
 */
function rawDocToEnrollmentRecord(
  doc: Record<string, unknown>
): EnrollmentRecord {
  let submittedAt = doc.submittedAt;
  if (!submittedAt) {
    if (doc.createdAt) {
      submittedAt =
        typeof doc.createdAt === 'string'
          ? doc.createdAt
          : new Date(doc.createdAt as number | string).toISOString();
    } else if (doc.submissionDate) {
      submittedAt =
        typeof doc.submissionDate === 'string'
          ? (doc.submissionDate as string).includes('T')
            ? doc.submissionDate
            : `${doc.submissionDate}T00:00:00.000Z`
          : new Date(doc.submissionDate as number | string).toISOString();
    } else {
      submittedAt = new Date().toISOString();
    }
  } else if (typeof submittedAt !== 'string') {
    submittedAt = new Date(submittedAt as number | string).toISOString();
  }

  return {
    _id: String(doc._id),
    referenceId:
      (doc.referenceId as string) ||
      `MB-OAH-${String(doc._id).slice(-6)}`,
    status: (doc.status as EnrollmentStatus) || 'submitted',
    adminNotes: (doc.adminNotes as string) || '',
    reviewedAt: doc.reviewedAt as string | undefined,
    reviewedBy: (doc.reviewedBy as string) || '',
    submittedAt: submittedAt as string,
    fullData: (doc.fullData || doc) as EnrollmentFormData,
    flatData: doc.flatData as Record<string, unknown> | undefined,
  };
}

/**
 * Fallback: filter SAMPLE_APPROVED_HOMES when MongoDB has no approved records.
 * This keeps the site functional during development / fresh DB.
 */
function filterSampleHomes(body: SearchRequest): PublicFacility[] {
  let homes = [...SAMPLE_APPROVED_HOMES];
  const query = (body.query || '').toLowerCase();

  if (query) {
    homes = homes.filter(
      (h) =>
        h.name.toLowerCase().includes(query) ||
        h.city.toLowerCase().includes(query) ||
        h.address.toLowerCase().includes(query) ||
        h.pinCode.includes(query) ||
        h.state.toLowerCase().includes(query)
    );
  }

  // Apply city filter
  if (body.filters?.city && typeof body.filters.city === 'string') {
    const cityFilter = (body.filters.city as string).toLowerCase();
    homes = homes.filter(
      (h) =>
        h.city.toLowerCase().includes(cityFilter) ||
        h.address.toLowerCase().includes(cityFilter)
    );
  }

  // Apply service filter
  if (body.filters?.services && Array.isArray(body.filters.services)) {
    const serviceKeys: Record<string, keyof PublicFacility['services']> = {
      'Assisted Living': 'assistedLiving',
      'Independent Living': 'independentLiving',
      'Dementia Care': 'dementiaCare',
      'Palliative Care': 'palliativeCare',
      'Home Hospital': 'homeHospital',
      'Day Care': 'dayCareServices',
    };

    homes = homes.filter((h) =>
      (body.filters!.services as string[]).every((svc) => {
        const key = serviceKeys[svc];
        return key ? h.services[key] : true;
      })
    );
  }

  // Apply price filter
  if (body.filters?.price) {
    const priceFilter = body.filters.price as { min?: number; max?: number };
    if (priceFilter.max) {
      homes = homes.filter((h) => h.startingPrice <= priceFilter.max!);
    }
    if (priceFilter.min) {
      homes = homes.filter((h) => h.startingPrice >= priceFilter.min!);
    }
  }

  // Sort
  if (body.sort?.field === 'price') {
    homes.sort((a, b) =>
      body.sort!.order === 'asc'
        ? a.startingPrice - b.startingPrice
        : b.startingPrice - a.startingPrice
    );
  }

  // Paginate
  const page = body.page || 1;
  const limit = body.limit || 20;
  const start = (page - 1) * limit;

  return homes.slice(start, start + limit);
}
