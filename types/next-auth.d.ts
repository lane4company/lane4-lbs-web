import type { LbsAdmin } from '@/apis/auth/auth.type';

/**
 * NextAuth 세션/토큰 타입 확장.
 * sms/verify 응답(admin + 토큰 + mustChangePassword) 과 로그인 시각(loginAt)을 노출한다.
 */
declare module 'next-auth' {
  interface Session {
    accessToken: string;
    refreshToken: string;
    admin: LbsAdmin;
    /** 로그인(SMS 인증 성공) 시각 epoch(ms) */
    loginAt: number;
    mustChangePassword: boolean;
    error: string | null;
  }

  interface User {
    id: string;
    accessToken: string;
    refreshToken: string;
    mustChangePassword: boolean;
    admin: LbsAdmin;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken: string;
    refreshToken: string;
    accessTokenExp: number;
    admin: LbsAdmin;
    loginAt: number;
    mustChangePassword: boolean;
    error: string | null;
  }
}
