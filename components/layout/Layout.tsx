import { PropsWithChildren } from 'react';

import IdleProvider from '@/contexts/IdleContext';

import Header from './Header';
import Sidebar from './Sidebar';

/** 인증된 화면 공통 레이아웃 (사이드바 + 헤더 + 무활동 자동 로그아웃) */
export default function Layout({ children }: PropsWithChildren) {
  return (
    <IdleProvider>
      <div className='flex min-h-screen bg-gray-100'>
        <Sidebar />
        <div className='flex min-w-0 flex-1 flex-col'>
          <Header />
          <main className='flex-1 overflow-x-auto p-6'>{children}</main>
        </div>
      </div>
    </IdleProvider>
  );
}
