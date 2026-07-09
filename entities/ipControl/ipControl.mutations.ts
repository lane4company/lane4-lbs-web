import { useMutation, useQueryClient } from '@tanstack/react-query';

import { IpControlService } from '@/apis/ipControl';
import { IpControlQueries } from '@/entities/ipControl/ipControl.queries';

function useInvalidateIpControlList() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: IpControlQueries.keys.all });
}

export const useCreateIpControl = () => {
  const invalidate = useInvalidateIpControlList();
  return useMutation({
    mutationFn: IpControlService.create,
    onSuccess: invalidate,
  });
};

export const useUpdateIpControl = () => {
  const invalidate = useInvalidateIpControlList();
  return useMutation({
    mutationFn: IpControlService.update,
    onSuccess: invalidate,
  });
};

export const useRemoveIpControl = () => {
  const invalidate = useInvalidateIpControlList();
  return useMutation({
    mutationFn: (id: number) => IpControlService.remove(id),
    onSuccess: invalidate,
  });
};
