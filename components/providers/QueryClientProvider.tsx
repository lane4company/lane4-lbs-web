import { PropsWithChildren, useState } from 'react';

import { message } from 'antd';
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider as ReactQueryClientProvider,
} from '@tanstack/react-query';
import { signOut } from 'next-auth/react';

import { ReservedError } from '@/utils/AxiosV2';

function resolveMessage(error: unknown): string {
  if (error instanceof ReservedError) return error.message;
  if (error instanceof Error) return error.message;
  return '요청 처리 중 오류가 발생했습니다.';
}

/** 인증 만료(401) 처리: 세션 정리 후 로그인으로 이동 */
async function handleUnauthorized(error: unknown): Promise<boolean> {
  if (error instanceof ReservedError && (error.code === 401 || error.code === 'UNAUTHORIZED')) {
    await signOut({ redirect: true, callbackUrl: '/login' });
    return true;
  }
  return false;
}

function metaMessage(meta: Record<string, unknown> | undefined): string | undefined {
  const value = meta?.errorMessage;
  return typeof value === 'string' ? value : undefined;
}

function createQueryClient(): QueryClient {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: async (error, query) => {
        if (await handleUnauthorized(error)) return;
        message.error(metaMessage(query.meta) ?? resolveMessage(error));
      },
    }),
    mutationCache: new MutationCache({
      onError: async (error, _variables, _context, mutation) => {
        if (await handleUnauthorized(error)) return;
        // 개별 폼에서 직접 에러를 다루는 경우 전역 알림 스킵
        if (mutation.meta?.skipGlobalMutationOnError) return;
        message.error(metaMessage(mutation.meta) ?? resolveMessage(error));
      },
    }),
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: false,
        staleTime: 30 * 1000,
      },
    },
  });
}

export default function QueryClientProvider({ children }: PropsWithChildren) {
  const [queryClient] = useState(createQueryClient);
  return <ReactQueryClientProvider client={queryClient}>{children}</ReactQueryClientProvider>;
}
