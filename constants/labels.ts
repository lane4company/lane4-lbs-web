import type { AccessType } from '@/apis/accessLog';
import type { AdminStatus } from '@/apis/admin';
import type { IpControlType } from '@/apis/ipControl';
import type { LbsEventType } from '@/apis/location';
import type { PermissionActionType } from '@/apis/permission';

export const EVENT_TYPE_LABEL: Record<LbsEventType, string> = {
  LOCATION: '위치',
  STATUS: '상태전이',
};

export const EVENT_TYPE_OPTIONS: Array<{ label: string; value: LbsEventType }> = [
  { label: '위치', value: 'LOCATION' },
  { label: '상태전이', value: 'STATUS' },
];

export const ACCESS_TYPE_LABEL: Record<AccessType, string> = {
  LOGIN: '로그인',
  LOGIN_FAIL: '로그인실패',
  LOGOUT: '로그아웃',
  VIEW: '조회',
  SEARCH: '검색',
  EXCEL_DOWNLOAD: '엑셀다운로드',
  DESTROY: '파기',
  MANAGE: '관리',
};

export const ACCESS_TYPE_OPTIONS: Array<{ label: string; value: AccessType }> = (
  Object.keys(ACCESS_TYPE_LABEL) as AccessType[]
).map((value) => ({ value, label: ACCESS_TYPE_LABEL[value] }));

export const PERMISSION_ACTION_LABEL: Record<PermissionActionType, string> = {
  GRANT: '부여',
  CHANGE: '변경',
  REVOKE: '제거',
};

export const PERMISSION_ACTION_OPTIONS: Array<{ label: string; value: PermissionActionType }> = (
  Object.keys(PERMISSION_ACTION_LABEL) as PermissionActionType[]
).map((value) => ({ value, label: PERMISSION_ACTION_LABEL[value] }));

export const ADMIN_STATUS_LABEL: Record<AdminStatus, string> = {
  ACTIVE: '정상',
  LOCKED: '잠금',
  DELETED: '제거',
};

export const IP_CONTROL_TYPE_LABEL: Record<IpControlType, string> = {
  WHITE: '화이트리스트',
  BLACK: '블랙리스트',
};

export const IP_CONTROL_TYPE_OPTIONS: Array<{ label: string; value: IpControlType }> = [
  { label: '화이트리스트', value: 'WHITE' },
  { label: '블랙리스트', value: 'BLACK' },
];

const SOURCE_LABEL: Record<string, string> = {
  MONITORING_API: '관제(연속위치)',
  DRIVER_API: '기사앱(상태전이)',
};

export function sourceLabel(source: string): string {
  return SOURCE_LABEL[source] ?? source;
}
