import { queryOptions } from '@tanstack/react-query';

import { PermissionService } from '@/apis/permission';

import type { PermissionHistoryListParams, PermissionListParams } from '@/apis/permission';

export class PermissionQueries {
  static readonly keys = {
    all: ['permission'] as const,
    list: (params: PermissionListParams) => [...PermissionQueries.keys.all, 'list', params] as const,
    histories: (params: PermissionHistoryListParams) =>
      [...PermissionQueries.keys.all, 'histories', params] as const,
  };

  static list(params: PermissionListParams) {
    return queryOptions({
      queryKey: PermissionQueries.keys.list(params),
      queryFn: () => PermissionService.getList(params),
    });
  }

  static histories(params: PermissionHistoryListParams) {
    return queryOptions({
      queryKey: PermissionQueries.keys.histories(params),
      queryFn: () => PermissionService.getHistories(params),
    });
  }
}
