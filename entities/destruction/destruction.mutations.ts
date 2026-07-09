import { useMutation, useQueryClient } from '@tanstack/react-query';

import { DestructionService } from '@/apis/destruction';
import { DestructionQueries } from '@/entities/destruction/destruction.queries';

export const useDestroyBusinessClosed = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: DestructionService.destroyBusinessClosed,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: DestructionQueries.keys.all }),
  });
};
