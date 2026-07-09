import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMemo } from 'react';

import { useSession } from 'next-auth/react';

import { MENU, MenuItemDef } from '@/constants/menu';
import { hasPermissionAtLeast, permissionLabel } from '@/constants/permission';

function parseMenuScope(menuScope: string | undefined): Set<string> {
  if (!menuScope) return new Set();
  return new Set(
    menuScope
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
  );
}

export default function Sidebar() {
  const router = useRouter();
  const { data: session } = useSession();
  const admin = session?.admin;

  const visibleMenu = useMemo<MenuItemDef[]>(() => {
    const scope = parseMenuScope(admin?.menuScope);
    return MENU.filter((item) => {
      const inScope = scope.size === 0 ? true : scope.has(item.key);
      const permitted = item.minPermission ? hasPermissionAtLeast(admin?.permissionType, item.minPermission) : true;
      return inScope && permitted;
    });
  }, [admin?.menuScope, admin?.permissionType]);

  return (
    <aside className='flex w-60 flex-col border-r border-gray-300 bg-white'>
      <div className='flex h-16 items-center border-b border-gray-300 px-6'>
        <div className='leading-tight'>
          <p className='text-sm font-bold text-navy-1000'>LANE4</p>
          <p className='text-xs text-gray-600'>위치정보 관리시스템</p>
        </div>
      </div>

      <nav className='flex-1 overflow-y-auto py-4'>
        <ul className='flex flex-col gap-1 px-3'>
          {visibleMenu.map((item) => {
            const active = router.pathname === item.path || router.pathname.startsWith(`${item.path}/`);
            return (
              <li key={item.key}>
                <Link
                  href={item.path}
                  className={[
                    'block rounded px-4 py-2.5 text-sm transition-colors',
                    active
                      ? 'bg-navy-1000 font-semibold text-white'
                      : 'text-gray-700 hover:bg-gray-100',
                  ].join(' ')}
                >
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className='border-t border-gray-300 px-6 py-4 text-xs text-gray-600'>
        {admin ? (
          <>
            <p className='font-medium text-gray-800'>{admin.name}</p>
            <p>{permissionLabel(admin.permissionType)}</p>
          </>
        ) : (
          <p>-</p>
        )}
      </div>
    </aside>
  );
}
