/**
 * Search Configuration Registry
 *
 * This file is the SINGLE SOURCE OF TRUTH for:
 *   - Which fields are searchable, filterable, sortable
 *   - How each field type is queried (text, exact, booleanMap, priceRange, etc.)
 *   - Validation constraints (maxLength, pattern)
 *   - User-facing value maps for boolean/enum fields
 *
 * To add a new searchable field to the old-age-home module:
 *   1. Add an entry to the `fields` object in OLD_AGE_HOME_SEARCH_CONFIG
 *   2. Specify the correct `mongoPath`, `type`, and capabilities
 *   3. No other code changes needed — the search engine reads this config automatically
 *
 * To add a completely new module (e.g., rooms, vendors):
 *   1. Create a new CollectionSearchConfig object
 *   2. Register it using registerSearchConfig('rooms', ROOM_SEARCH_CONFIG)
 *   3. Use the same SearchService / SearchQueryBuilder for the new module
 */

import { CollectionSearchConfig } from './types';

// ── Old Age Home Search Configuration ──────────────────────────────────────────

export const OLD_AGE_HOME_SEARCH_CONFIG: CollectionSearchConfig = {
  collectionName: process.env.MONGODB_COLLECTION || 'old age home registration',
  databaseName: 'merabetta',
  defaultFilter: { status: 'approved' },
  maxLimit: 50,
  defaultLimit: 20,
  maxQueryLength: 200,

  fields: {
    // ── Direct Text Search Fields ────────────────────────────────────────
    homeName: {
      mongoPath: 'fullData.homeName',
      type: 'text',
      searchable: true,
      filterable: true,
      sortable: true,
      maxLength: 100,
    },
    city: {
      mongoPath: 'fullData.city',
      type: 'text',
      searchable: true,
      filterable: true,
      sortable: true,
      maxLength: 50,
    },
    state: {
      mongoPath: 'fullData.state',
      type: 'text',
      searchable: true,
      filterable: true,
      sortable: false,
      maxLength: 50,
    },
    pinCode: {
      mongoPath: 'fullData.pinCode',
      type: 'exact',
      searchable: true,
      filterable: true,
      sortable: false,
      maxLength: 6,
      pattern: /^\d{1,6}$/,
    },
    address: {
      mongoPath: 'fullData.address',
      type: 'text',
      searchable: true,
      filterable: false,
      sortable: false,
      maxLength: 200,
    },

    // ── Attribute / Categorical Fields ───────────────────────────────────
    organizationType: {
      mongoPath: 'fullData.organizationType',
      type: 'exact',
      searchable: true,
      filterable: true,
      sortable: false,
      maxLength: 30,
    },

    // ── Service Fields (stored as boolean map in MongoDB) ────────────────
    //    e.g., fullData.servicesOffered.assistedLiving: true
    services: {
      mongoPath: 'fullData.servicesOffered',
      type: 'booleanMap',
      searchable: true,
      filterable: true,
      sortable: false,
      valueMap: {
        'Assisted Living': 'assistedLiving',
        'Independent Living': 'independentLiving',
        'Dementia Care': 'dementiaCare',
        'Palliative Care': 'palliativeCare',
        'Home Hospital': 'homeHospital',
        'Day Care': 'dayCareServices',
        'Meals': 'meals',
        'Recreational Activities': 'recreationalActivities',
      },
    },
    medical: {
      mongoPath: 'fullData.medicalFacilities',
      type: 'booleanMap',
      searchable: true,
      filterable: true,
      sortable: false,
      valueMap: {
        'Doctor Visits': 'doctorVisits',
        'Nursing Care': 'nursingCare',
        'Emergency Care': 'emergencyCare',
        'Physiotherapy': 'physiotherapy',
      },
    },

    // ── Numeric / Range Fields ───────────────────────────────────────────
    price: {
      mongoPath: 'fullData.facilityPricing',
      type: 'priceRange',
      searchable: false,
      filterable: true,
      sortable: true,
    },
    capacity: {
      mongoPath: 'fullData.totalCapacity',
      type: 'number',
      searchable: false,
      filterable: true,
      sortable: true,
    },
    yearEstablished: {
      mongoPath: 'fullData.yearEstablished',
      type: 'exact',
      searchable: false,
      filterable: true,
      sortable: true,
    },

    // ── Meta Fields ──────────────────────────────────────────────────────
    referenceId: {
      mongoPath: 'referenceId',
      type: 'exact',
      searchable: true,
      filterable: false,
      sortable: false,
      maxLength: 20,
    },
    createdAt: {
      mongoPath: 'submittedAt',
      type: 'date',
      searchable: false,
      filterable: false,
      sortable: true,
    },
  },
};

// ── Config Registry ────────────────────────────────────────────────────────────
// Maps logical collection keys to their search configurations.
// Add new collection configs here (e.g., 'rooms', 'vendors', 'bookings').

const SEARCH_CONFIGS: Record<string, CollectionSearchConfig> = {
  oldAgeHomes: OLD_AGE_HOME_SEARCH_CONFIG,
};

/** Get a search configuration by collection key */
export function getSearchConfig(configKey: string): CollectionSearchConfig | null {
  return SEARCH_CONFIGS[configKey] || null;
}

/** Register a new collection search configuration at runtime */
export function registerSearchConfig(
  key: string,
  config: CollectionSearchConfig
): void {
  SEARCH_CONFIGS[key] = config;
}

/** List all registered search config keys */
export function listSearchConfigs(): string[] {
  return Object.keys(SEARCH_CONFIGS);
}
