import type { PageParams } from '@/apis/type';

/** 이벤트 구분: 연속 위치 / 상태전이 */
export type LbsEventType = 'LOCATION' | 'STATUS';

/** 수집 원장 행 (이름/연락처 서버측 마스킹, 좌표 복호화) */
export interface LocationRow {
  id: number;
  eventType: LbsEventType;
  /** STATUS 이벤트의 상태값 (LOCATION 은 null) */
  eventStatus: string | null;
  driverName: string;
  driverMobile: string;
  /** 취득경로 (OS/기기 등) */
  acquirePath: string;
  /** 제공받는자 */
  receiver: string;
  /** 제공서비스 */
  providedService: string;
  latitude: number;
  longitude: number;
  allocationId: number | null;
  /** MONITORING_API | DRIVER_API */
  source: string;
  regDt: string;
}

/** 백업(HISTORY) 행 — 이름/연락처 없음, 백업 사유/일시 포함 */
export interface LocationHistoryRow {
  id: number;
  eventType: LbsEventType;
  eventStatus: string | null;
  acquirePath: string;
  receiver: string;
  providedService: string;
  latitude: number;
  longitude: number;
  allocationId: number | null;
  source: string;
  /** 백업사유 (운행완료/보존기간만료/동의철회/휴폐업) */
  backupReason: string;
  backupDt: string;
  regDt: string;
}

export interface LocationListParams extends PageParams {
  startDate?: string;
  endDate?: string;
  driverName?: string;
  eventType?: LbsEventType;
}

export type LocationHistoryListParams = LocationListParams;
