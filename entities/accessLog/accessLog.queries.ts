import { queryOptions } from '@tanstack/react-query';

import { AccessLogService } from '@/apis/accessLog';

import type { AccessLogListParams } from '@/apis/accessLog';

export class AccessLogQueries {
  static readonly keys = {
    all: ['accessLog'] as const,
    list: (params: AccessLogListParams) => [...AccessLogQueries.keys.all, 'list', params] as const,
  };

  static list(params: AccessLogListParams) {
    return queryOptions({
      queryKey: AccessLogQueries.keys.list(params),
      queryFn: () => AccessLogService.getList(params),
    });
  }
}
