export type PermissionType = 'OFFICER' | 'MANAGER' | 'HANDLER';

/** 권한 한글명 (실태점검 화면 표기 기준) */
export const PERMISSION_LABEL: Record<PermissionType, string> = {
  OFFICER: '위치정보관리책임자',
  MANAGER: '위치정보관리자',
  HANDLER: '위치정보취급자',
};

/** 권한 서열 (클수록 상위) */
const PERMISSION_ORDER: Record<PermissionType, number> = {
  HANDLER: 1,
  MANAGER: 2,
  OFFICER: 3,
};

export const PERMISSION_OPTIONS: Array<{ label: string; value: PermissionType }> = (
  Object.keys(PERMISSION_LABEL) as PermissionType[]
).map((value) => ({ value, label: PERMISSION_LABEL[value] }));

export function permissionLabel(type: PermissionType | undefined | null): string {
  if (!type) return '-';
  return PERMISSION_LABEL[type] ?? type;
}

/** current 권한이 required 이상인지 */
export function hasPermissionAtLeast(
  current: PermissionType | undefined | null,
  required: PermissionType,
): boolean {
  if (!current) return false;
  return PERMISSION_ORDER[current] >= PERMISSION_ORDER[required];
}
