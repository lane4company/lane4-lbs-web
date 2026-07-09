import { useMutation, useQueryClient } from '@tanstack/react-query';

import { AdminService } from '@/apis/admin';
import { AdminQueries } from '@/entities/admin/admin.queries';

function useInvalidateAdminList() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: AdminQueries.keys.all });
}

export const useCreateAdmin = () => {
  const invalidate = useInvalidateAdminList();
  return useMutation({
    mutationFn: AdminService.create,
    onSuccess: invalidate,
  });
};

export const useUpdateAdmin = () => {
  const invalidate = useInvalidateAdminList();
  return useMutation({
    mutationFn: AdminService.update,
    onSuccess: invalidate,
  });
};

export const useUpdateAdminPermission = () => {
  const invalidate = useInvalidateAdminList();
  return useMutation({
    mutationFn: AdminService.updatePermission,
    onSuccess: invalidate,
  });
};

export const useUnlockAdmin = () => {
  const invalidate = useInvalidateAdminList();
  return useMutation({
    mutationFn: (id: number) => AdminService.unlock(id),
    onSuccess: invalidate,
  });
};

export const useRemoveAdmin = () => {
  const invalidate = useInvalidateAdminList();
  return useMutation({
    mutationFn: (id: number) => AdminService.remove(id),
    onSuccess: invalidate,
  });
};
