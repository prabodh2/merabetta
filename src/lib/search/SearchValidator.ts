/**
 * Search Input Validator
 *
 * Validates and sanitizes all incoming search requests against the
 * collection's SearchConfig. Prevents:
 *   - MongoDB operator injection ($-prefixed keys)
 *   - Unregistered/disallowed field access
 *   - Regex abuse (oversized patterns)
 *   - Excessive pagination limits
 *   - Invalid data types
 *
 * This class is collection-agnostic — it reads validation rules from
 * the provided CollectionSearchConfig.
 */

import { CollectionSearchConfig, SearchRequest, FieldConfig } from './types';

export interface ValidationResult {
  valid: boolean;
  sanitized: SearchRequest;
  errors: string[];
}

export class SearchValidator {
  private config: CollectionSearchConfig;

  constructor(config: CollectionSearchConfig) {
    this.config = config;
  }

  /**
   * Validate and sanitize a raw search request.
   * Returns a ValidationResult with the sanitized request and any errors.
   */
  validate(request: SearchRequest): ValidationResult {
    const errors: string[] = [];
    const sanitized: SearchRequest = {};

    // 1. Validate query string
    if (request.query !== undefined && request.query !== null) {
      if (typeof request.query !== 'string') {
        errors.push('Query must be a string');
      } else {
        const q = request.query.trim();
        if (q.length > this.config.maxQueryLength) {
          errors.push(
            `Query exceeds maximum length of ${this.config.maxQueryLength} characters`
          );
        } else {
          sanitized.query = this.sanitizeString(q);
        }
      }
    }

    // 2. Validate search fields (which fields to search across)
    if (request.fields !== undefined && request.fields !== null) {
      if (!Array.isArray(request.fields)) {
        errors.push('Fields must be an array of field names');
      } else {
        const validFields = request.fields.filter((f) => {
          if (typeof f !== 'string') return false;
          const fieldConfig = this.config.fields[f];
          return fieldConfig && fieldConfig.searchable;
        });

        if (validFields.length === 0 && request.fields.length > 0) {
          errors.push(
            `No valid searchable fields specified. Allowed: ${this.getSearchableFieldNames().join(', ')}`
          );
        }

        sanitized.fields = validFields;
      }
    }

    // 3. Validate filters
    if (request.filters !== undefined && request.filters !== null) {
      if (
        typeof request.filters !== 'object' ||
        Array.isArray(request.filters)
      ) {
        errors.push('Filters must be an object');
      } else {
        sanitized.filters = this.validateFilters(request.filters, errors);
      }
    }

    // 4. Validate sort
    if (request.sort !== undefined && request.sort !== null) {
      if (typeof request.sort !== 'object' || Array.isArray(request.sort)) {
        errors.push('Sort must be an object with field and order properties');
      } else {
        const sortField = String(request.sort.field || '');
        const sortOrder = String(request.sort.order || 'desc');

        if (sortField && sortField !== 'relevance') {
          const fieldConfig = this.config.fields[sortField];
          if (!fieldConfig || !fieldConfig.sortable) {
            errors.push(
              `Field "${sortField}" is not sortable. Allowed: ${this.getSortableFieldNames().join(', ')}`
            );
          }
        }

        if (sortOrder && !['asc', 'desc'].includes(sortOrder)) {
          errors.push('Sort order must be "asc" or "desc"');
        }

        sanitized.sort = {
          field: sortField,
          order: sortOrder === 'asc' ? 'asc' : 'desc',
        };
      }
    }

    // 5. Validate pagination
    const page = Math.max(1, Math.floor(Number(request.page) || 1));
    const requestedLimit = Math.floor(
      Number(request.limit) || this.config.defaultLimit
    );
    const limit = Math.min(
      Math.max(1, requestedLimit),
      this.config.maxLimit
    );

    sanitized.page = page;
    sanitized.limit = limit;

    return {
      valid: errors.length === 0,
      sanitized,
      errors,
    };
  }

  // ── Private Helpers ────────────────────────────────────────────────────────

  /**
   * Validate each filter field and its value against the config.
   */
  private validateFilters(
    filters: Record<string, unknown>,
    errors: string[]
  ): Record<string, unknown> {
    const validated: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(filters)) {
      // Reject $-prefixed keys (MongoDB operator injection)
      if (key.startsWith('$')) {
        errors.push(`Invalid filter key: "${key}"`);
        continue;
      }

      const fieldConfig = this.config.fields[key];

      if (!fieldConfig) {
        errors.push(`Unknown filter field: "${key}"`);
        continue;
      }

      if (!fieldConfig.filterable) {
        errors.push(`Field "${key}" is not filterable`);
        continue;
      }

      const validatedValue = this.validateFilterValue(
        key,
        value,
        fieldConfig,
        errors
      );
      if (validatedValue !== undefined) {
        validated[key] = validatedValue;
      }
    }

    return validated;
  }

  /**
   * Validate a single filter value based on the field's type.
   */
  private validateFilterValue(
    key: string,
    value: unknown,
    fieldConfig: FieldConfig,
    errors: string[]
  ): unknown {
    switch (fieldConfig.type) {
      case 'text':
      case 'exact':
      case 'prefix':
        if (typeof value === 'string') {
          const s = this.sanitizeString(value);
          if (fieldConfig.maxLength && s.length > fieldConfig.maxLength) {
            errors.push(
              `Filter "${key}" exceeds max length of ${fieldConfig.maxLength}`
            );
            return undefined;
          }
          if (fieldConfig.pattern && !fieldConfig.pattern.test(s)) {
            errors.push(`Filter "${key}" has invalid format`);
            return undefined;
          }
          return s;
        }
        errors.push(`Filter "${key}" must be a string`);
        return undefined;

      case 'booleanMap':
        if (Array.isArray(value)) {
          const valid = value
            .filter((v) => typeof v === 'string')
            .map((v) => this.sanitizeString(String(v)))
            .filter((v) => {
              if (!fieldConfig.valueMap) return false;
              // Case-insensitive match against the valueMap keys
              const found = Object.keys(fieldConfig.valueMap).find(
                (k) => k.toLowerCase() === v.toLowerCase()
              );
              return !!found;
            });
          return valid.length > 0 ? valid : undefined;
        }
        if (typeof value === 'string') {
          const s = this.sanitizeString(value);
          if (fieldConfig.valueMap) {
            const found = Object.keys(fieldConfig.valueMap).find(
              (k) => k.toLowerCase() === s.toLowerCase()
            );
            if (found) return [found];
          }
          return undefined;
        }
        errors.push(`Filter "${key}" must be a string or array of strings`);
        return undefined;

      case 'number':
      case 'priceRange':
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          const range: Record<string, number> = {};
          const v = value as Record<string, unknown>;
          if (v.min !== undefined) {
            const min = Number(v.min);
            if (!isNaN(min) && min >= 0) range.min = min;
          }
          if (v.max !== undefined) {
            const max = Number(v.max);
            if (!isNaN(max) && max >= 0) range.max = max;
          }
          return Object.keys(range).length > 0 ? range : undefined;
        }
        if (typeof value === 'number' && value >= 0) {
          return { max: value };
        }
        errors.push(
          `Filter "${key}" must be a number or range object { min, max }`
        );
        return undefined;

      case 'date':
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          const dateRange: Record<string, string> = {};
          const v = value as Record<string, unknown>;
          if (typeof v.from === 'string') dateRange.from = v.from;
          if (typeof v.to === 'string') dateRange.to = v.to;
          return Object.keys(dateRange).length > 0 ? dateRange : undefined;
        }
        errors.push(`Filter "${key}" must be a date range { from, to }`);
        return undefined;

      case 'array':
        if (Array.isArray(value)) {
          const cleaned = value
            .filter((v) => typeof v === 'string')
            .map((v) => this.sanitizeString(String(v)));
          return cleaned.length > 0 ? cleaned : undefined;
        }
        if (typeof value === 'string') {
          return [this.sanitizeString(value)];
        }
        errors.push(`Filter "${key}" must be a string or array`);
        return undefined;

      default:
        errors.push(`Unknown field type for filter "${key}"`);
        return undefined;
    }
  }

  /**
   * Sanitize a string to prevent MongoDB injection and regex abuse.
   * Removes $-prefixed operators, trims, and limits length.
   */
  private sanitizeString(str: string): string {
    // Remove MongoDB operator characters
    let clean = str.replace(/\$/g, '');
    // Limit length to prevent regex abuse
    if (clean.length > 500) {
      clean = clean.substring(0, 500);
    }
    return clean.trim();
  }

  /** Get list of searchable field names from config */
  private getSearchableFieldNames(): string[] {
    return Object.entries(this.config.fields)
      .filter(([, fc]) => fc.searchable)
      .map(([name]) => name);
  }

  /** Get list of sortable field names from config */
  private getSortableFieldNames(): string[] {
    return Object.entries(this.config.fields)
      .filter(([, fc]) => fc.sortable)
      .map(([name]) => name);
  }
}
