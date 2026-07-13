import type { PermissionType } from '@/constants/permission';

export type AdminStatus = 'ACTIVE' | 'LOCKED' | 'DELETED';

/** GET /lbs/v2/admins 행 (전체 반환, 페이지네이션 없음 / name·mobile 서버측 마스킹) */
export interface AdminRow {
  adminId: number;
  loginId: string;
  name: string;
  mobile: string;
  department: string | null;
  permissionType: PermissionType;
  status: AdminStatus;
  loginFailCount: number;
  lastLoginAt: string | null;
  passwordUpdatedAt: string | null;
  regDt: string;
  /** 말소일 (status=DELETED 시) */
  deletedAt: string | null;
}

/** 목록 필터 (서버측 필터링 / keyword=이름 또는 로그인ID) */
export interface AdminListFilter {
  keyword?: string;
  permissionType?: PermissionType;
  status?: AdminStatus;
}

export interface AdminCreateParams {
  loginId: string;
  password: string;
  name: string;
  mobile: string;
  department?: string;
  permissionType: PermissionType;
}

export interface AdminUpdateParams {
  /** path (adminId) */
  id: number;
  name?: string;
  mobile?: string;
  department?: string;
}

export interface AdminPermissionUpdateParams {
  /** path (adminId) */
  id: number;
  permissionType: PermissionType;
}
