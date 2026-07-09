import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import { Modal } from 'antd';
import { signOut, useSession } from 'next-auth/react';

import { AuthService } from '@/apis/auth';
import { formatMmSs } from '@/utils/format';

const IDLE_TIMEOUT_MS = Number(process.env.NEXT_PUBLIC_IDLE_TIMEOUT_MS) || 600000; // 기본 10분
const WARN_BEFORE_MS = 60 * 1000; // 만료 60초 전 경고
const ACTIVITY_THROTTLE_MS = 5000; // 활동 갱신 스로틀
const TICK_MS = 1000;
const STORAGE_KEY = 'lbs:lastActivity';

const ACTIVITY_EVENTS: Array<keyof WindowEventMap> = [
  'mousemove',
  'keydown',
  'click',
  'scroll',
  'touchstart',
];

interface IdleContextValue {
  /** 자동 로그아웃까지 남은 시간(ms) */
  remainingMs: number;
  /** 세션 연장(활동 갱신) */
  extend: () => void;
}

const IdleContext = createContext<IdleContextValue | null>(null);

export function useIdle(): IdleContextValue {
  const context = useContext(IdleContext);
  if (!context) {
    throw new Error('useIdle must be used within IdleProvider');
  }
  return context;
}

export default function IdleProvider({ children }: PropsWithChildren) {
  const { status } = useSession();
  const isAuthenticated = status === 'authenticated';

  const lastActivityRef = useRef<number>(Date.now());
  const lastPersistRef = useRef<number>(0);
  const loggingOutRef = useRef<boolean>(false);

  const [remainingMs, setRemainingMs] = useState<number>(IDLE_TIMEOUT_MS);
  const [warnOpen, setWarnOpen] = useState<boolean>(false);

  const markActivity = useCallback((timestamp: number, persist: boolean) => {
    lastActivityRef.current = timestamp;
    setWarnOpen(false);
    if (persist && typeof window !== 'undefined' && timestamp - lastPersistRef.current >= ACTIVITY_THROTTLE_MS) {
      lastPersistRef.current = timestamp;
      window.localStorage.setItem(STORAGE_KEY, String(timestamp));
    }
  }, []);

  const extend = useCallback(() => {
    markActivity(Date.now(), true);
    setRemainingMs(IDLE_TIMEOUT_MS);
  }, [markActivity]);

  const performLogout = useCallback(async () => {
    if (loggingOutRef.current) return;
    loggingOutRef.current = true;
    setWarnOpen(false);
    try {
      await AuthService.logout();
    } catch {
      // 로그아웃 API 실패는 무시하고 세션은 반드시 정리한다.
    } finally {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(STORAGE_KEY);
      }
      await signOut({ redirect: true, callbackUrl: '/login' });
    }
  }, []);

  // 로그인 상태 진입 시 활동 타임스탬프 초기화
  useEffect(() => {
    if (!isAuthenticated) return;
    loggingOutRef.current = false;
    const now = Date.now();
    markActivity(now, true);
    setRemainingMs(IDLE_TIMEOUT_MS);
  }, [isAuthenticated, markActivity]);

  // 활동 이벤트 바인딩
  useEffect(() => {
    if (!isAuthenticated || typeof window === 'undefined') return;

    const onActivity = () => markActivity(Date.now(), true);
    ACTIVITY_EVENTS.forEach((event) => window.addEventListener(event, onActivity, { passive: true }));

    // 멀티탭 동기화: 다른 탭의 활동을 이 탭의 활동으로 반영
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY || !event.newValue) return;
      const value = Number(event.newValue);
      if (!Number.isNaN(value) && value > lastActivityRef.current) {
        lastActivityRef.current = value;
        setWarnOpen(false);
      }
    };
    window.addEventListener('storage', onStorage);

    return () => {
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, onActivity));
      window.removeEventListener('storage', onStorage);
    };
  }, [isAuthenticated, markActivity]);

  // 1초 tick: 남은 시간 계산 → 경고/로그아웃
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = window.setInterval(() => {
      const remaining = IDLE_TIMEOUT_MS - (Date.now() - lastActivityRef.current);
      setRemainingMs(Math.max(0, remaining));

      if (remaining <= 0) {
        void performLogout();
        return;
      }
      if (remaining <= WARN_BEFORE_MS) {
        setWarnOpen(true);
      }
    }, TICK_MS);

    return () => window.clearInterval(interval);
  }, [isAuthenticated, performLogout]);

  return (
    <IdleContext.Provider value={{ remainingMs, extend }}>
      {children}
      <Modal
        open={warnOpen && isAuthenticated}
        title='자동 로그아웃 안내'
        okText='로그인 연장'
        cancelText='로그아웃'
        closable={false}
        maskClosable={false}
        onOk={extend}
        onCancel={() => void performLogout()}
      >
        <p>
          무활동으로 인해 <strong>{formatMmSs(remainingMs)}</strong> 후 자동 로그아웃됩니다.
        </p>
        <p>계속 이용하시려면 로그인 연장을 눌러 주세요.</p>
      </Modal>
    </IdleContext.Provider>
  );
}
