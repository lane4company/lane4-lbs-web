import type { AppProps } from 'next/app';
import Head from 'next/head';
import { ReactElement } from 'react';

import { App as AntdApp, ConfigProvider } from 'antd';
import koKR from 'antd/locale/ko_KR';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { SessionProvider } from 'next-auth/react';

import 'antd/dist/reset.css';
import '@/styles/globals.css';

import Layout from '@/components/layout/Layout';
import QueryClientProvider from '@/components/providers/QueryClientProvider';

import type { NextPageWithLayout } from '@/types/page';

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

const antdTheme = {
  token: {
    colorPrimary: '#0A1650',
    borderRadius: 4,
    fontFamily:
      'Pretendard, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
};

export default function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page: ReactElement) => <Layout>{page}</Layout>);

  return (
    <>
      <Head>
        <title>LANE4 위치정보 관리시스템</title>
        <meta name='viewport' content='width=device-width, initial-scale=1' />
      </Head>
      <SessionProvider session={pageProps.session} refetchOnWindowFocus>
        <QueryClientProvider>
          <ConfigProvider locale={koKR} theme={antdTheme}>
            <AntdApp>{getLayout(<Component {...pageProps} />)}</AntdApp>
          </ConfigProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </SessionProvider>
    </>
  );
}
