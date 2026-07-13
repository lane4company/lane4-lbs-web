import { queryOptions } from '@tanstack/react-query';

import { AdminService } from '@/apis/admin';

import type { AdminListFilter } from '@/apis/admin';

export class AdminQueries {
  static readonly keys = {
    all: ['admin'] as const,
    list: (filter?: AdminListFilter) => [...AdminQueries.keys.all, 'list', filter ?? {}] as const,
  };

  /** 관리자 목록 (permissionType·status·keyword 서버측 필터) */
  static list(filter?: AdminListFilter) {
    return queryOptions({
      queryKey: AdminQueries.keys.list(filter),
      queryFn: () => AdminService.getList(filter),
    });
  }
}
