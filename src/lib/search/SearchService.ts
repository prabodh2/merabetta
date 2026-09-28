/**
 * Search Service — Orchestrator
 *
 * This is the main entry point for executing searches.
 * It orchestrates: Validate → Build Query → Execute → Return Results
 *
 * Usage:
 *   const service = new SearchService(OLD_AGE_HOME_SEARCH_CONFIG);
 *   const results = await service.search({ query: 'Panvel', fields: ['city'] });
 *   const suggestions = await service.getSuggestions('pan');
 *   const cities = await service.getDistinctValues('city');
 *
 * This class is collection-agnostic — swap the config to search any collection.
 */

import {
  CollectionSearchConfig,
  SearchRequest,
  SearchResponse,
  SuggestionItem,
} from './types';
import { SearchValidator } from './SearchValidator';
import { SearchQueryBuilder } from './SearchQueryBuilder';
import clientPromise from '../mongodb';

export class SearchService {
  private config: CollectionSearchConfig;
  private validator: SearchValidator;
  private queryBuilder: SearchQueryBuilder;

  constructor(config: CollectionSearchConfig) {
    this.config = config;
    this.validator = new SearchValidator(config);
    this.queryBuilder = new SearchQueryBuilder(config);
  }

  // ── Main Search ──────────────────────────────────────────────────────────

  /**
   * Execute a structured search request.
   * Returns paginated results with metadata.
   */
  async search(request: SearchRequest): Promise<SearchResponse> {
    // 1. Validate and sanitize
    const validation = this.validator.validate(request);

    if (!validation.valid) {
      return {
        success: false,
        data: [],
        pagination: {
          page: 1,
          limit: this.config.defaultLimit,
          total: 0,
          totalPages: 0,
        },
        search: {
          query: request.query || '',
          fields: request.fields || [],
          appliedFilters: {},
        },
        errors: validation.errors,
      };
    }

    const params = validation.sanitized;

    // 2. Build MongoDB query
    const built = this.queryBuilder.buildQuery(params);

    // 3. Execute against MongoDB
    try {
      const client = await clientPromise;
      const db = client.db(this.config.databaseName);
      const collection = db.collection(this.config.collectionName);

      let data: Record<string, unknown>[];
      let total: number;

      if (built.pipeline) {
        // Aggregation pipeline (for price sorting/filtering)
        const results = await collection
          .aggregate(built.pipeline)
          .toArray();

        const facetResult = (results[0] as Record<string, unknown>) || {
          metadata: [],
          data: [],
        };
        const metadata = facetResult.metadata as { total: number }[];
        data = (facetResult.data as Record<string, unknown>[]) || [];
        total = metadata?.[0]?.total || 0;
      } else {
        // Standard find + count
        const [docs, count] = await Promise.all([
          collection
            .find(built.filter)
            .sort(built.sort)
            .skip(built.skip)
            .limit(built.limit)
            .toArray(),
          collection.countDocuments(built.filter),
        ]);

        data = docs as unknown as Record<string, unknown>[];
        total = count;
      }

      // Normalize _id to string for JSON serialization
      data = data.map((doc) => ({
        ...doc,
        _id: String(doc._id),
      }));

      const page = params.page || 1;
      const limit = params.limit || this.config.defaultLimit;
      const totalPages = Math.ceil(total / limit) || 1;

      return {
        success: true,
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
        search: {
          query: params.query || '',
          fields: params.fields || [],
          appliedFilters: params.filters || {},
        },
      };
    } catch (error) {
      console.error('[SearchService] Query execution failed:', error);
      return {
        success: false,
        data: [],
        pagination: {
          page: 1,
          limit: this.config.defaultLimit,
          total: 0,
          totalPages: 0,
        },
        search: {
          query: params.query || '',
          fields: params.fields || [],
          appliedFilters: params.filters || {},
        },
        errors: ['Search service encountered an internal error'],
      };
    }
  }

  // ── Suggestions / Autocomplete ───────────────────────────────────────────

  /**
   * Generate search suggestions/autocomplete from database data + config.
   * Returns categorized suggestions (homes, cities, pincodes, services).
   */
  async getSuggestions(
    query: string,
    maxResults: number = 10
  ): Promise<SuggestionItem[]> {
    if (!query || query.trim().length < 2) return [];

    const sanitized = query
      .trim()
      .replace(/\$/g, '')
      .substring(0, 100);
    const escaped = sanitized.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    try {
      const client = await clientPromise;
      const db = client.db(this.config.databaseName);
      const collection = db.collection(this.config.collectionName);
      const baseFilter = this.config.defaultFilter || {};

      const suggestions: SuggestionItem[] = [];

      // Run queries in parallel for speed
      const [nameMatches, cityMatches, pincodeMatches, stateMatches] =
        await Promise.all([
          // 1. Home names matching query
          collection
            .find({
              ...baseFilter,
              'fullData.homeName': { $regex: escaped, $options: 'i' },
            })
            .project({ 'fullData.homeName': 1 })
            .limit(3)
            .toArray(),

          // 2. Distinct cities matching query
          collection.distinct('fullData.city', {
            ...baseFilter,
            'fullData.city': { $regex: escaped, $options: 'i' },
          }),

          // 3. Pincodes matching query (only if query looks numeric)
          /^\d+$/.test(sanitized)
            ? collection.distinct('fullData.pinCode', {
                ...baseFilter,
                'fullData.pinCode': { $regex: `^${escaped}` },
              })
            : Promise.resolve([]),

          // 4. States matching query
          collection.distinct('fullData.state', {
            ...baseFilter,
            'fullData.state': { $regex: escaped, $options: 'i' },
          }),
        ]);

      // Process home name matches
      const seenNames = new Set<string>();
      for (const doc of nameMatches) {
        const name = (doc as Record<string, unknown>).fullData
          ? ((doc as Record<string, unknown>).fullData as Record<string, unknown>)
              ?.homeName
          : undefined;
        if (typeof name === 'string' && name && !seenNames.has(name)) {
          seenNames.add(name);
          suggestions.push({
            text: name,
            category: 'Old Age Home',
            icon: '🏠',
            field: 'homeName',
          });
        }
      }

      // Process city matches
      (cityMatches as string[]).slice(0, 3).forEach((city) => {
        if (city && typeof city === 'string') {
          suggestions.push({
            text: city,
            category: 'City',
            icon: '🏙️',
            field: 'city',
          });
        }
      });

      // Process pincode matches
      (pincodeMatches as string[]).slice(0, 3).forEach((pin) => {
        if (pin && typeof pin === 'string') {
          suggestions.push({
            text: pin,
            category: 'Pincode',
            icon: '📮',
            field: 'pinCode',
          });
        }
      });

      // Process state matches
      (stateMatches as string[]).slice(0, 2).forEach((state) => {
        if (state && typeof state === 'string') {
          suggestions.push({
            text: state,
            category: 'State',
            icon: '🗺️',
            field: 'state',
          });
        }
      });

      // Match services from config (no DB call needed)
      const servicesConfig = this.config.fields.services;
      if (servicesConfig?.valueMap) {
        Object.keys(servicesConfig.valueMap)
          .filter((name) =>
            name.toLowerCase().includes(sanitized.toLowerCase())
          )
          .slice(0, 3)
          .forEach((name) => {
            suggestions.push({
              text: name,
              category: 'Care Service',
              icon: '🩺',
              field: 'services',
            });
          });
      }

      // Match medical services from config
      const medicalConfig = this.config.fields.medical;
      if (medicalConfig?.valueMap) {
        Object.keys(medicalConfig.valueMap)
          .filter((name) =>
            name.toLowerCase().includes(sanitized.toLowerCase())
          )
          .slice(0, 2)
          .forEach((name) => {
            suggestions.push({
              text: name,
              category: 'Medical Service',
              icon: '🏥',
              field: 'medical',
            });
          });
      }

      return suggestions.slice(0, maxResults);
    } catch (error) {
      console.error('[SearchService.getSuggestions] Error:', error);
      return [];
    }
  }

  // ── Distinct Values (for filter dropdowns) ───────────────────────────────

  /**
   * Get distinct values for a field from the database.
   * Useful for populating filter dropdowns (e.g., list of cities, states).
   */
  async getDistinctValues(fieldName: string): Promise<string[]> {
    const fieldConfig = this.config.fields[fieldName];
    if (!fieldConfig) return [];

    try {
      const client = await clientPromise;
      const db = client.db(this.config.databaseName);
      const collection = db.collection(this.config.collectionName);
      const baseFilter = this.config.defaultFilter || {};

      // For booleanMap fields, return the value map keys (no DB call)
      if (fieldConfig.type === 'booleanMap' && fieldConfig.valueMap) {
        return Object.keys(fieldConfig.valueMap);
      }

      const values = await collection.distinct(
        fieldConfig.mongoPath,
        baseFilter
      );

      return values
        .filter(
          (v: unknown) =>
            typeof v === 'string' && v.trim().length > 0
        )
        .sort() as string[];
    } catch (error) {
      console.error(
        `[SearchService.getDistinctValues] Error for ${fieldName}:`,
        error
      );
      return [];
    }
  }
}
