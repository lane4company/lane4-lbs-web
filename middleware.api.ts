import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

/**
 * 인증 가드.
 * - 미인증: /login 으로 (withAuth 기본 동작)
 * - mustChangePassword: 모든 경로에서 /password-change 로 강제
 * - 인증 상태로 /login 접근 시 리다이렉트는 login 페이지에서 처리(미들웨어 matcher 제외)
 */
export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    if (token?.mustChangePassword && pathname !== '/password-change') {
      const url = req.nextUrl.clone();
      url.pathname = '/password-change';
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  },
  {
    pages: {
      signIn: '/login',
      error: '/login',
    },
    cookies: {
      sessionToken: {
        name: 'lbs.next-auth.session-token',
      },
    },
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  },
);

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|_next/data|favicon.ico|login|images|css|fonts).*)'],
};
