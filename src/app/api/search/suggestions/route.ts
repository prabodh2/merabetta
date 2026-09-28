/**
 * GET /api/search/suggestions?q=pan — Autocomplete / Search Suggestions
 *
 * Returns categorized suggestions based on the query prefix.
 * Searches home names, cities, pincodes, states, services, and medical services.
 *
 * Response:
 * {
 *   "success": true,
 *   "query": "pan",
 *   "suggestions": [
 *     { "text": "Panvel", "category": "City", "icon": "🏙️", "field": "city" },
 *     { "text": "Palliative Care", "category": "Care Service", "icon": "🩺", "field": "services" }
 *   ]
 * }
 */

import { NextResponse } from 'next/server';
import { SearchService } from '@/lib/search/SearchService';
import { OLD_AGE_HOME_SEARCH_CONFIG } from '@/lib/search/SearchConfig';
import { SAMPLE_APPROVED_HOMES } from '@/utils/publicHomes';

const searchService = new SearchService(OLD_AGE_HOME_SEARCH_CONFIG);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get('q') || '').trim();

    if (query.length < 2) {
      return NextResponse.json({
        success: true,
        query,
        suggestions: [],
      });
    }

    // Limit query length for safety
    const safeQuery = query.substring(0, 100);
    const maxResults = Math.min(
      parseInt(searchParams.get('limit') || '10', 10),
      20
    );

    let suggestions = await searchService.getSuggestions(
      safeQuery,
      maxResults
    );

    // If database returned 0 suggestions (e.g. offline/timeout or fresh DB),
    // derive suggestions from sample homes and services
    if (suggestions.length === 0) {
      const q = safeQuery.toLowerCase();
      const fallbackList: typeof suggestions = [];

      // 1. Home names
      for (const home of SAMPLE_APPROVED_HOMES) {
        if (home.name.toLowerCase().includes(q)) {
          fallbackList.push({
            text: home.name,
            category: 'Senior Home',
            icon: '🏡',
            field: 'homeName',
          });
        }
      }

      // 2. Cities
      const uniqueCities = [...new Set(SAMPLE_APPROVED_HOMES.map((h) => h.city))];
      for (const city of uniqueCities) {
        if (city.toLowerCase().includes(q)) {
          fallbackList.push({
            text: city,
            category: 'City',
            icon: '🏙️',
            field: 'city',
          });
        }
      }

      // 3. Pincodes
      const uniquePins = [...new Set(SAMPLE_APPROVED_HOMES.map((h) => h.pinCode))];
      for (const pin of uniquePins) {
        if (pin.includes(q)) {
          fallbackList.push({
            text: pin,
            category: 'Pincode',
            icon: '📍',
            field: 'pinCode',
          });
        }
      }

      // 4. Care Services
      const standardServices = [
        'Assisted Living',
        'Independent Living',
        'Dementia Care',
        'Palliative Care',
        'Home Hospital',
        'Day Care',
        'Nursing Care',
        'Doctor Visits',
        'Physiotherapy',
        'Emergency Care',
      ];
      for (const svc of standardServices) {
        if (svc.toLowerCase().includes(q)) {
          fallbackList.push({
            text: svc,
            category: 'Care Service',
            icon: '🩺',
            field: 'services',
          });
        }
      }

      suggestions = fallbackList.slice(0, maxResults);
    }

    return NextResponse.json({
      success: true,
      query: safeQuery,
      suggestions,
    });
  } catch (error: unknown) {
    console.error('[API /api/search/suggestions] Error:', error);
    return NextResponse.json(
      {
        success: false,
        query: '',
        suggestions: [],
        error: 'Failed to fetch suggestions',
      },
      { status: 500 }
    );
  }
}
