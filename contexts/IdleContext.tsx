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

const IDLE_TIMEOUT_MS = Number(process.env.NEXT_PUBLIC_IDLE_TIMEOUT_MS) || 600000; // 자동 로그아웃까지의 무활동 시간, 기본 10분
const WARN_BEFORE_MS = 60 * 1000; // 로그아웃 60초 전부터 경고 모달 표시
const ACTIVITY_THROTTLE_MS = 5000; // 활동 이벤트마다 매번 저장하지 않도록 5초 단위로만 localStorage 기록
const TICK_MS = 1000; // 남은 시간 재계산 주기(1초)
const STORAGE_KEY = 'lbs:lastActivity'; // 탭 간 활동 시각 동기화용 localStorage 키

// 이 이벤트들이 감지되면 "활동 중"으로 간주해 타이머를 갱신한다
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

  // ref로 관리하는 이유: setInterval 콜백/이벤트 핸들러에서 최신 값을 읽어야 하는데,
  // state로 두면 클로저에 갇힌 stale 값을 참조하게 되어 리렌더 없이 최신값 추적이 필요함
  const lastActivityRef = useRef<number>(Date.now()); // 마지막 활동 시각
  const lastPersistRef = useRef<number>(0); // localStorage에 마지막으로 기록한 시각(스로틀 판단용)
  const loggingOutRef = useRef<boolean>(false); // 로그아웃 중복 실행 방지 플래그

  const [remainingMs, setRemainingMs] = useState<number>(IDLE_TIMEOUT_MS); // 헤더 등 UI에 남은 시간 표시용
  const [warnOpen, setWarnOpen] = useState<boolean>(false); // 만료 임박 경고 모달 표시 여부

  // 활동 발생 시 호출: 타이머 갱신 + (옵션) 다른 탭에도 알리기 위해 localStorage 기록
  const markActivity = useCallback((timestamp: number, persist: boolean) => {
    lastActivityRef.current = timestamp;
    setWarnOpen(false); // 활동이 있었으므로 경고 모달은 닫는다
    if (persist && typeof window !== 'undefined' && timestamp - lastPersistRef.current >= ACTIVITY_THROTTLE_MS) {
      lastPersistRef.current = timestamp;
      window.localStorage.setItem(STORAGE_KEY, String(timestamp));
    }
  }, []);

  // 경고 모달의 "로그인 연장" 버튼: 활동 시각을 지금으로 갱신하고 카운트다운을 리셋
  const extend = useCallback(() => {
    markActivity(Date.now(), true);
    setRemainingMs(IDLE_TIMEOUT_MS);
  }, [markActivity]);

  // 무활동 타임아웃 또는 사용자가 직접 "로그아웃"을 눌렀을 때 실행되는 실제 로그아웃 처리
  const performLogout = useCallback(async () => {
    if (loggingOutRef.current) return; // 이미 로그아웃 처리 중이면 중복 호출 무시
    loggingOutRef.current = true;
    setWarnOpen(false);
    try {
      await AuthService.logout(); // 서버 세션/리프레시 토큰 정리
    } catch {
      // 로그아웃 API 실패는 무시하고 세션은 반드시 정리한다.
    } finally {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(STORAGE_KEY); // 다음 로그인 시 이전 활동 기록이 남지 않도록 정리
      }
      await signOut({ redirect: true, callbackUrl: '/login' }); // NextAuth 세션 종료 + 로그인 페이지로 이동
    }
  }, []);

  // 로그인 상태로 전환될 때(로그인 직후 등) 활동 타임스탬프와 카운트다운을 초기화
  useEffect(() => {
    if (!isAuthenticated) return;
    loggingOutRef.current = false; // 재로그인 대비 플래그 리셋
    const now = Date.now();
    markActivity(now, true);
    setRemainingMs(IDLE_TIMEOUT_MS);
  }, [isAuthenticated, markActivity]);

  // 사용자 활동 이벤트 바인딩 + 멀티탭 동기화
  useEffect(() => {
    if (!isAuthenticated || typeof window === 'undefined') return;

    // mousemove/keydown/click/scroll/touchstart 중 하나라도 감지되면 활동으로 처리
    const onActivity = () => markActivity(Date.now(), true);
    ACTIVITY_EVENTS.forEach((event) => window.addEventListener(event, onActivity, { passive: true }));

    // 멀티탭 동기화: 다른 탭에서 활동이 기록되면(storage 이벤트) 이 탭의 타이머도 함께 갱신
    // → 한 탭만 쓰고 있어도 다른 탭 때문에 로그아웃되지 않게 함
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

  // 1초마다 남은 시간을 재계산해서: 만료 시 자동 로그아웃, 만료 임박 시 경고 모달 오픈
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = window.setInterval(() => {
      const remaining = IDLE_TIMEOUT_MS - (Date.now() - lastActivityRef.current);
      setRemainingMs(Math.max(0, remaining));

      if (remaining <= 0) {
        void performLogout(); // 타임아웃 도달 → 자동 로그아웃
        return;
      }
      if (remaining <= WARN_BEFORE_MS) {
        setWarnOpen(true); // 만료 60초 전부터 경고 모달 표시
      }
    }, TICK_MS);

    return () => window.clearInterval(interval);
  }, [isAuthenticated, performLogout]);

  return (
    <IdleContext.Provider value={{ remainingMs, extend }}>
      {children}
      {/* 만료 60초 전부터 뜨는 경고 모달: 연장 시 extend(), 취소/방치 시 performLogout() */}
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
