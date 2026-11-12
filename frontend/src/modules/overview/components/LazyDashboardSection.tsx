import React, { useCallback, useEffect, useRef, useState } from 'react';
import { overviewApi } from '../../../services/api';
import {
  getCachedSection,
  setCachedSection,
  type OverviewSectionKey,
} from '../utils/overviewCache';

interface LazyDashboardSectionProps<T = any> {
  sectionKey: OverviewSectionKey;
  cacheKey: string;
  branchId?: string;
  refreshNonce?: number;
  /** Intersection ratio threshold (0.35 = triggers when ~30-40% of section scrolls into view) */
  threshold?: number;
  minHeightClass?: string;
  loadingLabel?: string;
  className?: string;
  children: (data: T, loading: boolean) => React.ReactNode;
}

export function LazyDashboardSection<T = any>({
  sectionKey,
  cacheKey,
  branchId,
  refreshNonce = 0,
  threshold = 0.35,
  minHeightClass = 'min-h-[260px]',
  loadingLabel = 'Đang tải dữ liệu khi bạn cuộn tới...',
  className = '',
  children,
}: LazyDashboardSectionProps<T>) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inFlightRef = useRef(false);
  const hasFetchedForKeyRef = useRef<string>('');

  const [sectionData, setSectionData] = useState<T | null>(() => {
    const cached = getCachedSection<T>(cacheKey, sectionKey);
    return cached ? cached.data : null;
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadSection = useCallback(
    async (force = false) => {
      const requestSig = `${cacheKey}:${sectionKey}:${refreshNonce}`;
      if (inFlightRef.current) return;
      if (!force && hasFetchedForKeyRef.current === requestSig) return;

      const cached = !force ? getCachedSection<T>(cacheKey, sectionKey) : null;
      if (cached && !cached.isStale) {
        setSectionData(cached.data);
        hasFetchedForKeyRef.current = requestSig;
        return;
      }

      try {
        inFlightRef.current = true;
        if (!cached) setLoading(true);
        setError(null);
        const res = await overviewApi.getSection(sectionKey, branchId);
        setCachedSection(cacheKey, sectionKey, res);
        setSectionData(res as T);
        hasFetchedForKeyRef.current = requestSig;
      } catch (err) {
        console.error(`Error lazy-loading section "${sectionKey}":`, err);
        if (!cached) {
          setError('Không thể tải dữ liệu mục này. Vui lòng thử lại.');
        }
      } finally {
        inFlightRef.current = false;
        setLoading(false);
      }
    },
    [cacheKey, sectionKey, branchId, refreshNonce],
  );

  // Sync cache immediately if cacheKey or refreshNonce changes
  useEffect(() => {
    const cached = refreshNonce === 0 ? getCachedSection<T>(cacheKey, sectionKey) : null;
    if (cached && !cached.isStale) {
      setSectionData(cached.data);
      hasFetchedForKeyRef.current = `${cacheKey}:${sectionKey}:${refreshNonce}`;
      return;
    }

    if (cached && cached.isStale) {
      setSectionData(cached.data);
    } else if (refreshNonce > 0) {
      // Keep stale UI visible if already rendered while refreshing visible section, or reset for fresh mount
    } else {
      setSectionData(null);
    }
    hasFetchedForKeyRef.current = '';
  }, [cacheKey, sectionKey, refreshNonce]);

  // Attach IntersectionObserver (triggers when 30%-40% of section enters viewport)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const requestSig = `${cacheKey}:${sectionKey}:${refreshNonce}`;
    if (hasFetchedForKeyRef.current === requestSig) return;

    const cached = refreshNonce === 0 ? getCachedSection<T>(cacheKey, sectionKey) : null;
    if (cached && !cached.isStale) {
      setSectionData(cached.data);
      hasFetchedForKeyRef.current = requestSig;
      return;
    }

    if (typeof IntersectionObserver === 'undefined') {
      loadSection(refreshNonce > 0);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const isTallElementEntered =
            entry.isIntersecting &&
            entry.boundingClientRect.height > (window.innerHeight || 800) &&
            entry.boundingClientRect.top <= (window.innerHeight || 800) * 0.7;

          if (entry.isIntersecting && (entry.intersectionRatio >= threshold || isTallElementEntered)) {
            observer.disconnect();
            loadSection(refreshNonce > 0);
            break;
          }
        }
      },
      {
        threshold: [0, threshold, 0.4, 0.6],
      },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [cacheKey, sectionKey, refreshNonce, threshold, loadSection]);

  return (
    <div ref={containerRef} className={className}>
      {sectionData ? (
        children(sectionData, loading)
      ) : error ? (
        <div className={`${minHeightClass} rounded-3xl bg-white border border-rose-200 p-6 flex flex-col items-center justify-center gap-3 text-center`}>
          <p className="text-xs font-semibold text-rose-600">{error}</p>
          <button
            type="button"
            onClick={() => loadSection(true)}
            className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 cursor-pointer"
          >
            Tải lại
          </button>
        </div>
      ) : (
        <div
          className={`${minHeightClass} rounded-3xl bg-white/90 border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between animate-pulse`}
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="space-y-2 w-1/2">
              <div className="h-4 bg-slate-200 rounded w-3/4" />
              <div className="h-3 bg-slate-100 rounded w-full" />
            </div>
            <span className="text-[11px] font-semibold text-slate-400">{loadingLabel}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-4">
            <div className="h-20 rounded-2xl bg-slate-100" />
            <div className="h-20 rounded-2xl bg-slate-100" />
            <div className="h-20 rounded-2xl bg-slate-100" />
          </div>
          <div className="h-3 bg-slate-100 rounded w-1/3" />
        </div>
      )}
    </div>
  );
}
