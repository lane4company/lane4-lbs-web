import { queryOptions } from '@tanstack/react-query';

import { LocationService } from '@/apis/location';

import type { LocationHistoryListParams, LocationListParams } from '@/apis/location';

export class LocationQueries {
  static readonly keys = {
    all: ['location'] as const,
    list: (params: LocationListParams) => [...LocationQueries.keys.all, 'list', params] as const,
    histories: (params: LocationHistoryListParams) =>
      [...LocationQueries.keys.all, 'histories', params] as const,
  };

  static list(params: LocationListParams) {
    return queryOptions({
      queryKey: LocationQueries.keys.list(params),
      queryFn: () => LocationService.getList(params),
    });
  }

  static histories(params: LocationHistoryListParams) {
    return queryOptions({
      queryKey: LocationQueries.keys.histories(params),
      queryFn: () => LocationService.getHistories(params),
    });
  }
}
