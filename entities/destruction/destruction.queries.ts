import { queryOptions } from '@tanstack/react-query';

import { DestructionService } from '@/apis/destruction';

export class DestructionQueries {
  static readonly keys = {
    all: ['destruction'] as const,
    status: () => [...DestructionQueries.keys.all, 'status'] as const,
  };

  static status() {
    return queryOptions({
      queryKey: DestructionQueries.keys.status(),
      queryFn: () => DestructionService.getStatus(),
    });
  }
}
