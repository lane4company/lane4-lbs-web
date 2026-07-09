import { queryOptions } from '@tanstack/react-query';

import { IpControlService } from '@/apis/ipControl';

export class IpControlQueries {
  static readonly keys = {
    all: ['ipControl'] as const,
    list: () => [...IpControlQueries.keys.all, 'list'] as const,
  };

  /** 전체 IP 통제 목록 (필터/페이지네이션은 클라이언트 처리) */
  static list() {
    return queryOptions({
      queryKey: IpControlQueries.keys.list(),
      queryFn: () => IpControlService.getList(),
    });
  }
}
