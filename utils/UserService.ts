import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getSession, signOut } from 'next-auth/react';

import type { Session } from 'next-auth';

/**
 * admin-api 전용 axios 인스턴스.
 * 요청마다 next-auth 세션의 accessToken 을 Bearer 로 주입한다.
 * (lane4-admin utils/UserService.ts 패턴 이식)
 */
const ApiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

async function getAccessToken(): Promise<string | undefined> {
  const session = await getSession();
  return session?.accessToken;
}

ApiClient.interceptors.request.use(async (request: InternalAxiosRequestConfig) => {
  const token = await getAccessToken();
  if (token) {
    request.headers.set('Authorization', `Bearer ${token}`);
  }
  return request;
});

ApiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // 인증 실패(만료/세션 없음) 시 로그인으로 강제 이동
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      await signOut({ redirect: false });
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default ApiClient;

/** 서버 컴포넌트/프리패치 등에서 세션을 직접 주입할 때 사용 */
export function setAuthorizationHeader(session: Session | null): void {
  if (session?.accessToken) {
    ApiClient.defaults.headers.common['Authorization'] = `Bearer ${session.accessToken}`;
  }
}
