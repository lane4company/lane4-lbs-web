import { queryOptions } from '@tanstack/react-query';

import { AdminService } from '@/apis/admin';

export class AdminQueries {
  static readonly keys = {
    all: ['admin'] as const,
    list: () => [...AdminQueries.keys.all, 'list'] as const,
  };

  /** 전체 관리자 목록 (필터/페이지네이션은 클라이언트 처리) */
  static list() {
    return queryOptions({
      queryKey: AdminQueries.keys.list(),
      queryFn: () => AdminService.getList(),
    });
  }
}
