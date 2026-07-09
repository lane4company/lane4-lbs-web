import type { PermissionType } from '@/constants/permission';

/**
 * 사이드바 메뉴 정의.
 * - scope: session.admin.menuScope(콤마 문자열)에 이 키가 포함되어야 노출
 * - minPermission: 지정 시 해당 권한 이상만 노출 (menuScope 와 AND 조건)
 */
export interface MenuItemDef {
  key: string;
  name: string;
  path: string;
  minPermission?: PermissionType;
}

export const MENU: MenuItemDef[] = [
  { key: 'provision', name: '제공기록', path: '/provision' },
  { key: 'access', name: '접근기록', path: '/access', minPermission: 'MANAGER' },
  { key: 'account', name: '계정관리', path: '/account', minPermission: 'OFFICER' },
  { key: 'permission', name: '권한관리', path: '/permission' },
  { key: 'ip', name: 'IP관리', path: '/ip', minPermission: 'OFFICER' },
  { key: 'destruction', name: '파기관리', path: '/destruction', minPermission: 'OFFICER' },
];
