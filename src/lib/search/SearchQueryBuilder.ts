/**
 * Generic MongoDB Query Builder
 *
 * Converts validated search parameters into safe MongoDB queries.
 * Supports multiple field types (text, exact, booleanMap, priceRange, etc.)
 * and automatically selects the right query strategy based on the field config.
 *
 * Architecture:
 *   SearchRequest → validate fields against config → build $match/$or/$and
 *   → build $sort → build $skip/$limit → optionally wrap in aggregation pipeline
 *
 * This class never reads user input directly — it only works with
 * pre-validated parameters from SearchValidator.
 */

import { CollectionSearchConfig, SearchRequest, FieldConfig } from './types';

export interface BuiltQuery {
  filter: Record<string, unknown>;
  sort: Record<string, 1 | -1>;
  skip: number;
  limit: number;
  /** When set, use collection.aggregate(pipeline) instead of find(filter) */
  pipeline?: Record<string, unknown>[];
}

export class SearchQueryBuilder {
  private config: CollectionSearchConfig;

  constructor(config: CollectionSearchConfig) {
    this.config = config;
  }

  /**
   * Build a complete MongoDB query from validated search parameters.
   */
  buildQuery(params: SearchRequest): BuiltQuery {
    const conditions: Record<string, unknown>[] = [];

    // Always apply default filter (e.g., status: 'approved')
    if (this.config.defaultFilter) {
      conditions.push({ ...this.config.defaultFilter });
    }

    // Build text/exact search conditions from the query string
    if (params.query && params.query.trim()) {
      const searchCondition = this.buildSearchConditions(
        params.query,
        params.fields
      );
      if (searchCondition) {
        conditions.push(searchCondition);
      }
    }

    // Build filter conditions
    if (params.filters && Object.keys(params.filters).length > 0) {
      const filterConditions = this.buildFilterConditions(params.filters);
      filterConditions.forEach((fc) => conditions.push(fc));
    }

    // Combine all conditions with $and
    const filter =
      conditions.length > 0
        ? conditions.length === 1
          ? conditions[0]
          : { $and: conditions }
        : {};

    // Build sort
    const sort = this.buildSort(params.sort);

    // Pagination
    const page = params.page || 1;
    const limit = params.limit || this.config.defaultLimit;
    const skip = (page - 1) * limit;

    // Check if we need an aggregation pipeline (price sort/filter needs computed field)
    if (this.needsAggregation(params)) {
      return {
        filter,
        sort,
        skip,
        limit,
        pipeline: this.buildAggregationPipeline(
          filter,
          sort,
          skip,
          limit,
          params
        ),
      };
    }

    return { filter, sort, skip, limit };
  }

  // ── Text Search Conditions ───────────────────────────────────────────────

  /**
   * Build $or conditions for searching the query string across multiple fields.
   */
  private buildSearchConditions(
    query: string,
    fields?: string[]
  ): Record<string, unknown> | null {
    const sanitizedQuery = query.trim();
    if (!sanitizedQuery) return null;

    // Determine which fields to search
    let searchFields: [string, FieldConfig][];

    if (fields && fields.length > 0) {
      searchFields = fields
        .map((f) => [f, this.config.fields[f]] as [string, FieldConfig])
        .filter(([, fc]) => fc && fc.searchable);
    } else {
      // Default: search ALL searchable fields
      searchFields = Object.entries(this.config.fields).filter(
        ([, fc]) => fc.searchable
      );
    }

    if (searchFields.length === 0) return null;

    const orConditions: Record<string, unknown>[] = [];

    for (const [, fieldConfig] of searchFields) {
      const conditions = this.buildFieldSearchCondition(
        fieldConfig,
        sanitizedQuery
      );
      if (conditions) {
        if (Array.isArray(conditions)) {
          orConditions.push(...conditions);
        } else {
          orConditions.push(conditions);
        }
      }
    }

    if (orConditions.length === 0) return null;
    if (orConditions.length === 1) return orConditions[0];
    return { $or: orConditions };
  }

  /**
   * Build search condition for a single field based on its type.
   */
  private buildFieldSearchCondition(
    fieldConfig: FieldConfig,
    query: string
  ): Record<string, unknown> | Record<string, unknown>[] | null {
    const escaped = this.escapeRegex(query);

    switch (fieldConfig.type) {
      case 'text':
        // Case-insensitive partial match
        return {
          [fieldConfig.mongoPath]: { $regex: escaped, $options: 'i' },
        };

      case 'exact':
        // For exact fields: try both exact match and prefix match
        return [
          { [fieldConfig.mongoPath]: query },
          {
            [fieldConfig.mongoPath]: {
              $regex: `^${escaped}`,
              $options: 'i',
            },
          },
        ];

      case 'prefix':
        return {
          [fieldConfig.mongoPath]: {
            $regex: `^${escaped}`,
            $options: 'i',
          },
        };

      case 'booleanMap':
        // Search for matching service/medical names in the valueMap
        if (!fieldConfig.valueMap) return null;
        const matchingConditions: Record<string, unknown>[] = [];

        for (const [displayName, subField] of Object.entries(
          fieldConfig.valueMap
        )) {
          if (displayName.toLowerCase().includes(query.toLowerCase())) {
            matchingConditions.push({
              [`${fieldConfig.mongoPath}.${subField}`]: true,
            });
          }
        }

        return matchingConditions.length > 0 ? matchingConditions : null;

      case 'array':
        // Search within array elements
        return {
          [fieldConfig.mongoPath]: { $regex: escaped, $options: 'i' },
        };

      default:
        // number, date, priceRange are not text-searchable
        return null;
    }
  }

  // ── Filter Conditions ────────────────────────────────────────────────────

  /**
   * Build MongoDB conditions from filter key-value pairs.
   */
  private buildFilterConditions(
    filters: Record<string, unknown>
  ): Record<string, unknown>[] {
    const conditions: Record<string, unknown>[] = [];

    for (const [key, value] of Object.entries(filters)) {
      const fieldConfig = this.config.fields[key];
      if (!fieldConfig || !fieldConfig.filterable) continue;

      // Skip price filters here — handled in aggregation pipeline
      if (fieldConfig.type === 'priceRange') continue;

      const condition = this.buildFilterCondition(fieldConfig, value);
      if (condition) {
        conditions.push(condition);
      }
    }

    return conditions;
  }

  /**
   * Build a single filter condition based on field type.
   */
  private buildFilterCondition(
    fieldConfig: FieldConfig,
    value: unknown
  ): Record<string, unknown> | null {
    switch (fieldConfig.type) {
      case 'text':
        if (typeof value === 'string') {
          return {
            [fieldConfig.mongoPath]: {
              $regex: this.escapeRegex(value),
              $options: 'i',
            },
          };
        }
        return null;

      case 'exact':
        if (typeof value === 'string') {
          // Case-insensitive exact match
          return {
            [fieldConfig.mongoPath]: {
              $regex: `^${this.escapeRegex(value)}$`,
              $options: 'i',
            },
          };
        }
        return null;

      case 'booleanMap':
        if (Array.isArray(value) && fieldConfig.valueMap) {
          const boolConditions: Record<string, unknown>[] = [];

          for (const v of value) {
            // Case-insensitive lookup in the valueMap
            const mapKey = Object.keys(fieldConfig.valueMap).find(
              (k) => k.toLowerCase() === String(v).toLowerCase()
            );
            if (mapKey) {
              const subField = fieldConfig.valueMap[mapKey];
              boolConditions.push({
                [`${fieldConfig.mongoPath}.${subField}`]: true,
              });
            }
          }

          if (boolConditions.length > 0) {
            // All specified services must be true ($and)
            return boolConditions.length === 1
              ? boolConditions[0]
              : { $and: boolConditions };
          }
        }
        return null;

      case 'number': {
        if (typeof value === 'object' && value !== null) {
          const range = value as { min?: number; max?: number };
          const condition: Record<string, unknown> = {};

          // totalCapacity is stored as a string in MongoDB, so compare as strings
          // Using $expr with $toInt for accurate numeric comparison
          if (range.min !== undefined || range.max !== undefined) {
            const exprConditions: Record<string, unknown>[] = [];

            if (range.min !== undefined) {
              exprConditions.push({
                $gte: [
                  {
                    $convert: {
                      input: `$${fieldConfig.mongoPath}`,
                      to: 'int',
                      onError: 0,
                      onNull: 0,
                    },
                  },
                  range.min,
                ],
              });
            }
            if (range.max !== undefined) {
              exprConditions.push({
                $lte: [
                  {
                    $convert: {
                      input: `$${fieldConfig.mongoPath}`,
                      to: 'int',
                      onError: 0,
                      onNull: 0,
                    },
                  },
                  range.max,
                ],
              });
            }

            if (exprConditions.length === 1) {
              return { $expr: exprConditions[0] };
            }
            return { $expr: { $and: exprConditions } };
          }

          return Object.keys(condition).length > 0
            ? { [fieldConfig.mongoPath]: condition }
            : null;
        }
        return null;
      }

      case 'array':
        if (Array.isArray(value)) {
          return { [fieldConfig.mongoPath]: { $all: value } };
        }
        if (typeof value === 'string') {
          return { [fieldConfig.mongoPath]: value };
        }
        return null;

      default:
        return null;
    }
  }

  // ── Sort ──────────────────────────────────────────────────────────────────

  /**
   * Build MongoDB sort specification from validated sort params.
   */
  private buildSort(
    sort?: { field: string; order: 'asc' | 'desc' }
  ): Record<string, 1 | -1> {
    if (!sort || !sort.field) {
      return { _id: -1 }; // Default: newest first
    }

    if (sort.field === 'relevance') {
      return { _id: -1 }; // Relevance scoring requires Atlas Search (Phase 3)
    }

    if (sort.field === 'price') {
      // Computed field — will be handled by aggregation pipeline
      return { _computedStartingPrice: sort.order === 'asc' ? 1 : -1 };
    }

    const fieldConfig = this.config.fields[sort.field];
    if (!fieldConfig || !fieldConfig.sortable) {
      return { _id: -1 };
    }

    return { [fieldConfig.mongoPath]: sort.order === 'asc' ? 1 : -1 };
  }

  // ── Aggregation Pipeline ─────────────────────────────────────────────────

  /**
   * Check whether the query requires an aggregation pipeline
   * (needed for computed fields like starting price).
   */
  private needsAggregation(params: SearchRequest): boolean {
    if (params.sort?.field === 'price') return true;
    if (params.filters?.price) return true;
    return false;
  }

  /**
   * Build an aggregation pipeline that:
   *   1. $match — base filter
   *   2. $addFields — compute starting price from all pricing categories
   *   3. $match — price filter (if specified)
   *   4. $sort
   *   5. $facet — return both total count and paginated results
   */
  private buildAggregationPipeline(
    filter: Record<string, unknown>,
    sort: Record<string, 1 | -1>,
    skip: number,
    limit: number,
    params: SearchRequest
  ): Record<string, unknown>[] {
    const pipeline: Record<string, unknown>[] = [];

    // Stage 1: Match base conditions
    if (Object.keys(filter).length > 0) {
      pipeline.push({ $match: filter });
    }

    // Stage 2: Compute starting price as the minimum "from" across all pricing categories
    // Pricing is stored as: fullData.facilityPricing.assistedLiving.from: "15000" (string)
    const priceConvert = (path: string) => ({
      $convert: {
        input: `$fullData.facilityPricing.${path}.from`,
        to: 'int',
        onError: 999999,
        onNull: 999999,
      },
    });

    pipeline.push({
      $addFields: {
        _computedStartingPrice: {
          $min: [
            priceConvert('assistedLiving'),
            priceConvert('independentLiving'),
            priceConvert('palliativeCare'),
            priceConvert('homeHospital'),
            priceConvert('dementiaCare'),
            priceConvert('dayCareServices'),
          ],
        },
      },
    });

    // Stage 3: Price filter (if specified)
    if (params.filters?.price) {
      const priceFilter = params.filters.price as {
        min?: number;
        max?: number;
      };
      const priceMatch: Record<string, unknown> = {};
      if (priceFilter.min !== undefined) priceMatch.$gte = priceFilter.min;
      if (priceFilter.max !== undefined) priceMatch.$lte = priceFilter.max;

      if (Object.keys(priceMatch).length > 0) {
        pipeline.push({
          $match: { _computedStartingPrice: priceMatch },
        });
      }
    }

    // Stage 4: Sort
    pipeline.push({ $sort: sort });

    // Stage 5: Facet — total count + paginated slice
    pipeline.push({
      $facet: {
        metadata: [{ $count: 'total' }],
        data: [{ $skip: skip }, { $limit: limit }],
      },
    });

    return pipeline;
  }

  // ── Utilities ────────────────────────────────────────────────────────────

  /**
   * Escape special regex characters in user input.
   * Prevents regex injection via search queries.
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
