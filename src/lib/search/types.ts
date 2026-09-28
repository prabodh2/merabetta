/**
 * Generic Search System Types
 *
 * These types are collection-agnostic and can be used with any MongoDB collection.
 * The same types power old-age-home search today and can power rooms, vendors,
 * bookings search tomorrow — no code duplication needed.
 */

// ── Field Type Definitions ─────────────────────────────────────────────────────

/** Supported search field types that determine query strategy */
export type SearchFieldType =
  | 'text'        // Case-insensitive partial match ($regex)
  | 'exact'       // Exact match or prefix match
  | 'prefix'      // Prefix-only match
  | 'number'      // Numeric range ($gte, $lte)
  | 'date'        // Date range
  | 'booleanMap'  // Object with boolean sub-fields (e.g., services.assistedLiving: true)
  | 'priceRange'  // Nested price range objects with from/to string values
  | 'array';      // Array field matching ($in, $all)

/** Configuration for a single searchable/filterable field */
export interface FieldConfig {
  /** The actual MongoDB document path (e.g., 'fullData.city') */
  mongoPath: string;
  /** How this field should be searched/queried */
  type: SearchFieldType;
  /** Whether this field can be used in text search queries */
  searchable: boolean;
  /** Whether this field can be used as a filter */
  filterable: boolean;
  /** Whether results can be sorted by this field */
  sortable: boolean;
  /**
   * For booleanMap type: maps user-facing display names to MongoDB sub-field keys.
   * Example: { 'Nursing Care': 'nursingCare', 'Doctor Visits': 'doctorVisits' }
   */
  valueMap?: Record<string, string>;
  /** Maximum allowed input length for this field */
  maxLength?: number;
  /** Regex pattern that input must match (e.g., pincode: /^\d{1,6}$/) */
  pattern?: RegExp;
}

// ── Collection Configuration ───────────────────────────────────────────────────

/**
 * Configuration for a searchable collection.
 * Each module (old age homes, rooms, vendors, etc.) defines its own config.
 */
export interface CollectionSearchConfig {
  /** MongoDB collection name */
  collectionName: string;
  /** MongoDB database name */
  databaseName: string;
  /** Filter always applied to every query (e.g., { status: 'approved' }) */
  defaultFilter?: Record<string, unknown>;
  /** Registry of all searchable/filterable/sortable fields */
  fields: Record<string, FieldConfig>;
  /** Maximum results per page (hard limit to prevent abuse) */
  maxLimit: number;
  /** Default results per page when not specified */
  defaultLimit: number;
  /** Maximum query string length */
  maxQueryLength: number;
}

// ── Search Request / Response ──────────────────────────────────────────────────

/** Structured search request from the frontend */
export interface SearchRequest {
  /** The search query text */
  query?: string;
  /** Which fields to search across (if empty, searches all searchable fields) */
  fields?: string[];
  /** Filter criteria: field name → filter value */
  filters?: Record<string, unknown>;
  /** Sort specification */
  sort?: {
    field: string;
    order: 'asc' | 'desc';
  };
  /** Page number (1-indexed) */
  page?: number;
  /** Results per page */
  limit?: number;
}

/** Standardized search response */
export interface SearchResponse<T = unknown> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  search: {
    query: string;
    fields: string[];
    appliedFilters: Record<string, unknown>;
  };
  errors?: string[];
}

// ── Suggestions / Autocomplete ─────────────────────────────────────────────────

/** A single autocomplete suggestion */
export interface SuggestionItem {
  /** Display text */
  text: string;
  /** Category label (e.g., 'City', 'Old Age Home', 'Service') */
  category: string;
  /** Emoji icon for the category */
  icon: string;
  /** Which search field this suggestion maps to */
  field: string;
}

/** Response from the suggestions/autocomplete endpoint */
export interface SuggestionsResponse {
  success: boolean;
  suggestions: SuggestionItem[];
  query: string;
}
