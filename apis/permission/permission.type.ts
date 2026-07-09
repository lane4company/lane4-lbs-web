import type { PageParams } from '@/apis/type';
import type { PermissionType } from '@/constants/permission';

/** 권한 마스터 행 (권한자/역할/이용/제공/파기) */
export interface PermissionRow {
  id: number;
  adminId: number;
  name: string;
  loginId: string;
  permissionType: PermissionType;
  /** 이용 */
  canUse: boolean;
  /** 제공 */
  canProvide: boolean;
  /** 파기 */
  canDestroy: boolean;
  regDt: string;
}

/** 권한 이력 유형 */
export type PermissionActionType = 'GRANT' | 'CHANGE' | 'REVOKE';

/** 권한 부여/변경/말소 이력 행 (대상자/유형/전후 권한/수행자/IP/일시) */
export interface PermissionHistoryRow {
  id: number;
  targetName: string;
  targetLoginId: string;
  actionType: PermissionActionType;
  beforePermission: PermissionType | null;
  afterPermission: PermissionType | null;
  actorName: string;
  actorLoginId: string;
  ip: string;
  regDt: string;
}

export type PermissionListParams = PageParams;

export interface PermissionHistoryListParams extends PageParams {
  startDate?: string;
  endDate?: string;
  actionType?: PermissionActionType;
}
