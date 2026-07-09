import { useRouter } from 'next/router';
import { useCallback } from 'react';

import { DEFAULT_PER_PAGE } from '@/apis/type';

export function getQueryString(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export function getQueryNumber(value: string | string[] | undefined, fallback: number): number {
  const raw = getQueryString(value);
  const parsed = raw ? Number(raw) : Number.NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

type QueryPatch = Record<string, string | number | undefined>;

/**
 * URL 쿼리스트링과 목록 필터/페이지 상태를 동기화한다.
 * (뒤로가기/새로고침/공유 시 조회 조건 유지)
 */
export function usePageQuery(defaultPerPage: number = DEFAULT_PER_PAGE) {
  const router = useRouter();

  const page = getQueryNumber(router.query.page, 1);
  const perPage = getQueryNumber(router.query.perPage, defaultPerPage);

  const setQuery = useCallback(
    (patch: QueryPatch) => {
      const merged: Record<string, string> = {};
      Object.entries(router.query).forEach(([key, value]) => {
        const stringValue = getQueryString(value);
        if (stringValue !== undefined) merged[key] = stringValue;
      });
      Object.entries(patch).forEach(([key, value]) => {
        if (value === undefined || value === '') {
          delete merged[key];
        } else {
          merged[key] = String(value);
        }
      });
      void router.push({ pathname: router.pathname, query: merged }, undefined, { shallow: true });
    },
    [router],
  );

  const setPage = useCallback(
    (nextPage: number, nextPerPage: number) => setQuery({ page: nextPage, perPage: nextPerPage }),
    [setQuery],
  );

  /** 필터 변경 시 사용: 1페이지로 리셋하며 조건 반영 */
  const applyFilter = useCallback((patch: QueryPatch) => setQuery({ ...patch, page: 1 }), [setQuery]);

  return { router, page, perPage, query: router.query, setQuery, setPage, applyFilter };
}
