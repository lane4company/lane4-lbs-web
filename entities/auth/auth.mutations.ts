import { useMutation } from '@tanstack/react-query';

import { AuthService } from '@/apis/auth';

/** SMS 인증번호 재발송 */
export const useResendSms = () => {
  return useMutation({
    mutationFn: AuthService.resendSms,
    meta: { skipGlobalMutationOnError: true },
  });
};

/** 비밀번호 변경 */
export const useChangePassword = () => {
  return useMutation({
    mutationFn: AuthService.changePassword,
    meta: { skipGlobalMutationOnError: true },
  });
};
