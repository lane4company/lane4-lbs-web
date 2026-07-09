import type { NextPage } from 'next';
import type { ReactElement, ReactNode } from 'react';

/** getLayout 패턴을 지원하는 페이지 타입 */
export type NextPageWithLayout<P = object> = NextPage<P> & {
  getLayout?: (page: ReactElement) => ReactNode;
};
