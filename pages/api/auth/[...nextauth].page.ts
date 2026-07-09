import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import NextAuth, { NextAuthOptions, User } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';

import type { CommonResponse } from '@/apis/type';
import type { LbsJwtPayload, RefreshResult, SmsVerifyResult } from '@/apis/auth/auth.type';

const useSecureCookies = process.env.NEXTAUTH_URL?.startsWith('https://') ?? false;
const API_URL = process.env.NEXT_PUBLIC_API_URL;

/** access token 만료 이 시간(초) 이내로 남으면 refresh 시도 */
const REFRESH_THRESHOLD_SEC = 60;

function extractServerMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as CommonResponse<{ message?: string }> | { message?: string } | undefined;
    if (data && typeof data === 'object') {
      const inner = 'data' in data ? data.data : data;
      if (inner && typeof inner === 'object' && typeof inner.message === 'string') return inner.message;
    }
  }
  return fallback;
}

async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const response = await axios.post<CommonResponse<RefreshResult>>(`${API_URL}/lbs/v2/auth/refresh`, {
      refreshToken: token.refreshToken,
    });

    if (!response.data?.result || !response.data.data) {
      throw new Error('refresh failed');
    }

    const { accessToken, refreshToken } = response.data.data;
    const decoded = jwtDecode<LbsJwtPayload>(accessToken);

    return {
      ...token,
      accessToken,
      refreshToken: refreshToken ?? token.refreshToken,
      accessTokenExp: decoded.exp,
      error: null,
    };
  } catch {
    return { ...token, error: 'RefreshAccessTokenError' };
  }
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt' },
  cookies: {
    sessionToken: {
      name: 'lbs.next-auth.session-token',
      options: {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure: useSecureCookies,
      },
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    CredentialsProvider({
      id: 'lbs-login',
      name: 'LBS',
      type: 'credentials',
      credentials: {
        mfaToken: { label: 'mfaToken', type: 'text' },
        authCode: { label: 'authCode', type: 'text' },
      },
      async authorize(credentials, req): Promise<User | null> {
        if (!credentials?.mfaToken || !credentials?.authCode) {
          throw new Error('인증 정보가 올바르지 않습니다.');
        }

        const forwardedFor = (req?.headers?.['x-forwarded-for'] as string | undefined) ?? '';

        try {
          const response = await axios.post<CommonResponse<SmsVerifyResult>>(
            `${API_URL}/lbs/v2/auth/sms/verify`,
            { mfaToken: credentials.mfaToken, authCode: credentials.authCode },
            {
              headers: {
                'Content-Type': 'application/json',
                'X-Forwarded-For': forwardedFor,
              },
            },
          );

          if (response.data?.result && response.data.data) {
            const data = response.data.data;
            return {
              id: String(data.admin.adminId),
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
              mustChangePassword: data.mustChangePassword,
              admin: data.admin,
            };
          }
          return null;
        } catch (error) {
          throw new Error(extractServerMessage(error, '인증에 실패했습니다. 다시 시도해 주세요.'));
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // 최초 로그인: user(=authorize 반환) 정보로 토큰 초기화
      if (user) {
        const decoded = jwtDecode<LbsJwtPayload>(user.accessToken);
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.admin = user.admin;
        token.mustChangePassword = user.mustChangePassword;
        token.accessTokenExp = decoded.exp;
        token.loginAt = Date.now();
        token.error = null;
        return token;
      }

      const now = Math.floor(Date.now() / 1000);
      const remaining = token.accessTokenExp - now;
      if (remaining > REFRESH_THRESHOLD_SEC || token.error) {
        return token;
      }
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.admin = token.admin;
      session.loginAt = token.loginAt;
      session.mustChangePassword = token.mustChangePassword;
      session.error = token.error ?? null;
      return session;
    },
  },
};

export default NextAuth(authOptions);
