export type OverviewSectionKey =
  | 'ai_widgets'
  | 'appointments_table'
  | 'active_staff'
  | 'doctor_profile'
  | 'reception_panels'
  | 'finance_overview'
  | 'chairs_panel'
  | 'maintenance_panel'
  | 'nurse_shift'
  | 'branch_ops';

interface CacheEntry<T = any> {
  data: T;
  fetchedAt: number;
}

interface OverviewCacheBucket {
  summary?: CacheEntry;
  sections: Record<string, CacheEntry>;
}

const CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes fresh window; stale-while-revalidate afterwards
const STORAGE_PREFIX = 'smartschedule_overview_swr_v1:';
const memoryCache = new Map<string, OverviewCacheBucket>();

export function buildOverviewCacheKey(userId?: string, roleName?: string, branchId?: string): string {
  return `${userId || 'anon'}:${roleName || 'default'}:${branchId || 'ALL'}`;
}

function readBucket(cacheKey: string): OverviewCacheBucket {
  const mem = memoryCache.get(cacheKey);
  if (mem) return mem;

  try {
    const raw = sessionStorage.getItem(`${STORAGE_PREFIX}${cacheKey}`);
    if (raw) {
      const parsed = JSON.parse(raw) as OverviewCacheBucket;
      if (parsed && typeof parsed === 'object') {
        const normalized: OverviewCacheBucket = {
          summary: parsed.summary,
          sections: parsed.sections || {},
        };
        memoryCache.set(cacheKey, normalized);
        return normalized;
      }
    }
  } catch {
    // Ignore storage read errors cleanly
  }

  const empty: OverviewCacheBucket = { sections: {} };
  memoryCache.set(cacheKey, empty);
  return empty;
}

function persistBucket(cacheKey: string, bucket: OverviewCacheBucket) {
  memoryCache.set(cacheKey, bucket);
  try {
    sessionStorage.setItem(`${STORAGE_PREFIX}${cacheKey}`, JSON.stringify(bucket));
  } catch {
    // Ignore quota errors cleanly
  }
}

export function getCachedSummary<T = any>(cacheKey: string): { data: T; isStale: boolean } | null {
  const bucket = readBucket(cacheKey);
  if (!bucket.summary) return null;
  const age = Date.now() - bucket.summary.fetchedAt;
  return {
    data: bucket.summary.data as T,
    isStale: age > CACHE_TTL_MS,
  };
}

export function setCachedSummary<T = any>(cacheKey: string, data: T) {
  const bucket = readBucket(cacheKey);
  bucket.summary = { data, fetchedAt: Date.now() };
  persistBucket(cacheKey, bucket);
}

export function getCachedSection<T = any>(cacheKey: string, section: OverviewSectionKey): { data: T; isStale: boolean } | null {
  const bucket = readBucket(cacheKey);
  const entry = bucket.sections[section];
  if (!entry) return null;
  const age = Date.now() - entry.fetchedAt;
  return {
    data: entry.data as T,
    isStale: age > CACHE_TTL_MS,
  };
}

export function setCachedSection<T = any>(cacheKey: string, section: OverviewSectionKey, data: T) {
  const bucket = readBucket(cacheKey);
  bucket.sections[section] = { data, fetchedAt: Date.now() };
  persistBucket(cacheKey, bucket);
}

export function clearOverviewCache(cacheKey?: string) {
  if (cacheKey) {
    memoryCache.delete(cacheKey);
    try {
      sessionStorage.removeItem(`${STORAGE_PREFIX}${cacheKey}`);
    } catch {}
    return;
  }

  memoryCache.clear();
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (k && k.startsWith(STORAGE_PREFIX)) keysToRemove.push(k);
    }
    keysToRemove.forEach((k) => sessionStorage.removeItem(k));
  } catch {}
}
