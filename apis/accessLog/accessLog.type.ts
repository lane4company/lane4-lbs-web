import type { PageParams } from '@/apis/type';
import type { PermissionType } from '@/constants/permission';

/** 접근 유형 (항목) */
export type AccessType =
  | 'LOGIN'
  | 'LOGIN_FAIL'
  | 'LOGOUT'
  | 'VIEW'
  | 'SEARCH'
  | 'EXCEL_DOWNLOAD'
  | 'DESTROY'
  | 'MANAGE';

export type AccessResult = 'SUCCESS' | 'FAIL';

export interface AccessLogRow {
  id: number;
  adminId: number | null;
  loginId: string;
  name: string;
  permissionType: PermissionType;
  /** 접근 항목 */
  accessType: AccessType;
  /** 접근 대상 설명 (= uri) */
  description: string | null;
  uri: string | null;
  method: string | null;
  queryParams: string | null;
  ip: string;
  userAgent: string | null;
  result: AccessResult;
  accessDt: string;
}

export interface AccessLogListParams extends PageParams {
  startDate?: string;
  endDate?: string;
  accessType?: AccessType;
  loginId?: string;
}
