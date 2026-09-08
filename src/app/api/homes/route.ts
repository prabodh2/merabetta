import { NextResponse } from 'next/server';
import { getEnrollments } from '@/lib/enrollmentStore';
import { transformRecordToPublicFacility, PublicFacility, SAMPLE_APPROVED_HOMES } from '@/utils/publicHomes';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const city = (searchParams.get('city') || '').trim().toLowerCase();
    const search = (searchParams.get('search') || '').trim().toLowerCase();
    const careType = (searchParams.get('careType') || 'all').trim().toLowerCase();
    const maxPriceParam = parseInt(searchParams.get('maxPrice') || '0', 10);
    const sortBy = searchParams.get('sortBy') || 'featured';

    // Fetch approved records from store
    const result = await getEnrollments({
      status: 'approved',
      limit: 100,
      search,
    });

    let facilities: PublicFacility[] = (result.records || []).map((rec, i) =>
      transformRecordToPublicFacility(rec, i)
    );

    // If database has 0 approved facilities (e.g. fresh DB or local dev without Mongo), fallback to sample homes
    if (facilities.length === 0) {
      facilities = [...SAMPLE_APPROVED_HOMES];
      if (search) {
        facilities = facilities.filter(
          (f) =>
            f.name.toLowerCase().includes(search) ||
            f.city.toLowerCase().includes(search) ||
            f.address.toLowerCase().includes(search)
        );
      }
    }

    // City filter
    if (city && city !== 'all') {
      facilities = facilities.filter(
        (f) =>
          f.city.toLowerCase().includes(city) ||
          f.address.toLowerCase().includes(city) ||
          city.includes(f.city.toLowerCase())
      );
    }

    // Care Type filter
    if (careType && careType !== 'all') {
      facilities = facilities.filter((f) => {
        if (careType === 'assisted_living' || careType === 'assisted') return f.services.assistedLiving;
        if (careType === 'palliative' || careType === 'bedridden') return f.services.palliativeCare;
        if (careType === 'independent') return f.services.independentLiving;
        if (careType === 'dementia') return f.services.dementiaCare;
        if (careType === 'home_hospital' || careType === 'hospital') return f.services.homeHospital;
        return true;
      });
    }

    // Max Budget filter
    if (maxPriceParam > 0) {
      facilities = facilities.filter((f) => f.startingPrice <= maxPriceParam);
    }

    // Sorting
    if (sortBy === 'price_asc') {
      facilities.sort((a, b) => a.startingPrice - b.startingPrice);
    } else if (sortBy === 'price_desc') {
      facilities.sort((a, b) => b.startingPrice - a.startingPrice);
    } else if (sortBy === 'rating') {
      facilities.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'capacity') {
      facilities.sort((a, b) => b.capacity - a.capacity);
    }

    // List of unique cities for the dropdown
    let availableCities = Array.from(
      new Set(
        facilities
          .map((r) => r.city || '')
          .filter((c) => c && c.length > 1)
      )
    ).sort();

    if (availableCities.length === 0) {
      availableCities = ['Mumbai', 'Pune', 'Thane', 'Nashik', 'Navi Mumbai'];
    }

    return NextResponse.json({
      success: true,
      total: facilities.length,
      facilities,
      availableCities,
    });
  } catch (error: unknown) {
    console.error('[API /api/homes] Error fetching homes:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch senior living facilities';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
