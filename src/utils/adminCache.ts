import { EnrollmentRecord, EnrollmentStatus } from '@/types/enrollment';

export interface AdminCachedData {
  records: EnrollmentRecord[];
  totalRecords: number;
  totalPages: number;
  stats: {
    total: number;
    submitted: number;
    approved: number;
    rejected: number;
  };
  cachedAt: number;
}

export interface AdminFilterState {
  page: number;
  limit: number;
  search: string;
  status: string;
  sortOrder: 'asc' | 'desc';
}

const CACHE_STORE_KEY = 'merabetta_admin_query_cache_v1';
const FILTERS_STORE_KEY = 'merabetta_admin_saved_filters_v1';
const LAST_REFRESHED_KEY = 'merabetta_admin_last_refreshed_v1';
const RELOAD_HANDLED_KEY = 'merabetta_admin_reload_cleared_v1';

// In-memory fallback if sessionStorage is unavailable
const memoryCache: Record<string, AdminCachedData> = {};
let memoryLastRefreshed: string | null = null;
let memoryFilters: AdminFilterState | null = null;

const isBrowser = () => typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined';

export function generateQueryKey(params: {
  page: number;
  limit: number;
  search: string;
  status: string;
  sortOrder: string;
}): string {
  return `${params.page}_${params.limit}_${params.search.trim().toLowerCase()}_${params.status.toLowerCase()}_${params.sortOrder}`;
}

/**
 * Check if the current page was loaded via a browser reload (F5 / Cmd+R / Browser reload button).
 * If so, invalidate the cache once so fresh database data is loaded.
 */
export function checkAndConsumeBrowserReload(): boolean {
  if (!isBrowser()) return false;
  try {
    const navEntries = window.performance.getEntriesByType('navigation');
    if (navEntries && navEntries.length > 0) {
      const isReload = (navEntries[0] as PerformanceNavigationTiming).type === 'reload';
      if (isReload) {
        const handledInThisSession = window.sessionStorage.getItem(RELOAD_HANDLED_KEY);
        // Only clear once per page reload event
        if (!handledInThisSession) {
          clearAdminCache();
          window.sessionStorage.setItem(RELOAD_HANDLED_KEY, 'true');
          return true;
        }
      } else {
        window.sessionStorage.removeItem(RELOAD_HANDLED_KEY);
      }
    }
  } catch (err) {
    console.warn('[adminCache] Failed to detect navigation type:', err);
  }
  return false;
}

export function getAdminQueryCache(queryKey: string): AdminCachedData | null {
  if (!isBrowser()) {
    return memoryCache[queryKey] || null;
  }

  try {
    const raw = window.sessionStorage.getItem(CACHE_STORE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<string, AdminCachedData>;
    return parsed[queryKey] || null;
  } catch {
    return null;
  }
}

export function setAdminQueryCache(
  queryKey: string,
  data: Omit<AdminCachedData, 'cachedAt'> & { cachedAt?: number }
): void {
  const cachedData: AdminCachedData = {
    ...data,
    cachedAt: data.cachedAt || Date.now(),
  };

  const timeStr = new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (!isBrowser()) {
    memoryCache[queryKey] = cachedData;
    memoryLastRefreshed = timeStr;
    return;
  }

  try {
    const raw = window.sessionStorage.getItem(CACHE_STORE_KEY);
    const store: Record<string, AdminCachedData> = raw ? JSON.parse(raw) : {};
    store[queryKey] = cachedData;
    window.sessionStorage.setItem(CACHE_STORE_KEY, JSON.stringify(store));
    window.sessionStorage.setItem(LAST_REFRESHED_KEY, timeStr);
  } catch (err) {
    console.warn('[adminCache] Failed to save query cache:', err);
  }
}

export function clearAdminCache(): void {
  if (!isBrowser()) {
    for (const k in memoryCache) delete memoryCache[k];
    memoryLastRefreshed = null;
    return;
  }

  try {
    window.sessionStorage.removeItem(CACHE_STORE_KEY);
  } catch (err) {
    console.warn('[adminCache] Failed to clear query cache:', err);
  }
}

/**
 * Updates a specific record across all cached query results in sessionStorage.
 * This ensures that approving, rejecting, or editing a record on the detail page or
 * via quick actions immediately updates the table without requiring a database query.
 */
export function updateRecordInCache(idOrRef: string, updates: Partial<EnrollmentRecord>): void {
  if (!isBrowser()) {
    for (const key in memoryCache) {
      applyUpdatesToCachedData(memoryCache[key], idOrRef, updates);
    }
    return;
  }

  try {
    const raw = window.sessionStorage.getItem(CACHE_STORE_KEY);
    if (!raw) return;
    const store: Record<string, AdminCachedData> = JSON.parse(raw);
    let modified = false;

    for (const key in store) {
      const changed = applyUpdatesToCachedData(store[key], idOrRef, updates);
      if (changed) modified = true;
    }

    if (modified) {
      window.sessionStorage.setItem(CACHE_STORE_KEY, JSON.stringify(store));
    }
  } catch (err) {
    console.warn('[adminCache] Failed to update record in cache:', err);
  }
}

function applyUpdatesToCachedData(
  cachedData: AdminCachedData,
  idOrRef: string,
  updates: Partial<EnrollmentRecord>
): boolean {
  let changed = false;
  if (!cachedData || !cachedData.records) return false;

  cachedData.records = cachedData.records.map((rec) => {
    if (rec._id === idOrRef || rec.referenceId === idOrRef) {
      changed = true;
      const oldStatus = rec.status;
      const newStatus = updates.status;

      // If status changed, adjust stats counts accordingly
      if (newStatus && newStatus !== oldStatus && cachedData.stats) {
        if (oldStatus === 'submitted' && cachedData.stats.submitted > 0) cachedData.stats.submitted--;
        if (oldStatus === 'approved' && cachedData.stats.approved > 0) cachedData.stats.approved--;
        if (oldStatus === 'rejected' && cachedData.stats.rejected > 0) cachedData.stats.rejected--;

        if (newStatus === 'submitted') cachedData.stats.submitted++;
        if (newStatus === 'approved') cachedData.stats.approved++;
        if (newStatus === 'rejected') cachedData.stats.rejected++;
      }

      return {
        ...rec,
        ...updates,
        fullData: updates.fullData
          ? { ...rec.fullData, ...updates.fullData }
          : rec.fullData,
      };
    }
    return rec;
  });

  return changed;
}

export function saveAdminFilters(filters: AdminFilterState): void {
  if (!isBrowser()) {
    memoryFilters = filters;
    return;
  }
  try {
    window.sessionStorage.setItem(FILTERS_STORE_KEY, JSON.stringify(filters));
  } catch {}
}

export function getSavedAdminFilters(): AdminFilterState | null {
  if (!isBrowser()) {
    return memoryFilters;
  }
  try {
    const raw = window.sessionStorage.getItem(FILTERS_STORE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getLastRefreshedTime(): string | null {
  if (!isBrowser()) return memoryLastRefreshed;
  try {
    return window.sessionStorage.getItem(LAST_REFRESHED_KEY);
  } catch {
    return null;
  }
}
