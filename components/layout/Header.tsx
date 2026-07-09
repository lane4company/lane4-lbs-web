import { useEffect, useState } from 'react';

import { Button } from 'antd';
import { signOut, useSession } from 'next-auth/react';

import { AuthService } from '@/apis/auth';
import { useIdle } from '@/contexts/IdleContext';
import { permissionLabel } from '@/constants/permission';
import { formatDateTime, formatMmSs } from '@/utils/format';

export default function Header() {
  const { data: session } = useSession();
  const { remainingMs } = useIdle();
  const [now, setNow] = useState<string>(() => formatDateTime(Date.now()));

  // 현재시각 1초 tick
  useEffect(() => {
    const interval = window.setInterval(() => setNow(formatDateTime(Date.now())), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const admin = session?.admin;

  const onLogout = async () => {
    try {
      await AuthService.logout();
    } catch {
      // 서버 로그아웃 실패해도 세션은 정리한다.
    } finally {
      await signOut({ redirect: true, callbackUrl: '/login' });
    }
  };

  return (
    <header className='flex h-16 items-center justify-between border-b border-gray-300 bg-white px-6'>
      <div className='flex items-center gap-6 text-xs text-gray-700'>
        <span>
          현재시각 <span className='font-medium text-gray-800'>{now}</span>
        </span>
        <span>
          접속시간 <span className='font-medium text-gray-800'>{formatDateTime(session?.loginAt)}</span>
        </span>
        <span>
          자동 로그아웃까지{' '}
          <span className={remainingMs <= 60000 ? 'font-semibold text-point-danger' : 'font-medium text-gray-800'}>
            {formatMmSs(remainingMs)}
          </span>
        </span>
      </div>

      <div className='flex items-center gap-4'>
        <span className='text-sm'>
          <span className='font-semibold text-navy-1000'>{admin?.name ?? '-'}</span>
          <span className='ml-1 text-gray-600'>({permissionLabel(admin?.permissionType)})</span>
        </span>
        <Button size='small' onClick={onLogout}>
          로그아웃
        </Button>
      </div>
    </header>
  );
}
