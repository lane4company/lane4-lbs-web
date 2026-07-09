import { AxiosV2 } from '@/utils/AxiosV2';

import type {
  LoginParams,
  LoginResult,
  PasswordChangeParams,
  SmsResendParams,
  SmsResendResult,
} from '@/apis/auth/auth.type';

/**
 * 브라우저에서 직접 호출하는 인증 API.
 * (sms/verify · refresh 는 NextAuth 서버 라우트 authorize/jwt 콜백에서 별도 처리)
 */
export class AuthService {
  /** 1단계: ID/PW 검증 → mfaToken 발급 */
  static async login(params: LoginParams): Promise<LoginResult> {
    return AxiosV2.POST<LoginResult, LoginParams>({ url: 'lbs/v2/auth/login', params }).then((res) => res.data);
  }

  /** SMS 인증번호 재발송 */
  static async resendSms(params: SmsResendParams): Promise<SmsResendResult> {
    return AxiosV2.POST<SmsResendResult, SmsResendParams>({ url: 'lbs/v2/auth/sms/resend', params }).then(
      (res) => res.data,
    );
  }

  /** 비밀번호 변경 (Bearer 필요) */
  static async changePassword(params: PasswordChangeParams): Promise<boolean> {
    return AxiosV2.PUT<boolean, PasswordChangeParams>({ url: 'lbs/v2/auth/password', params }).then(
      (res) => res.data,
    );
  }

  /** 로그아웃 (Bearer 필요) — 서버 세션/토큰 무효화 */
  static async logout(): Promise<boolean> {
    return AxiosV2.POST<boolean>({ url: 'lbs/v2/auth/logout' }).then((res) => res.data);
  }
}
