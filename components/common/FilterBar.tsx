import { PropsWithChildren, ReactNode } from 'react';

interface FilterBarProps {
  /** 우측 정렬 액션 (검색/초기화 버튼 등) */
  actions?: ReactNode;
}

/** 필터 입력 영역 공통 컨테이너 */
export default function FilterBar({ children, actions }: PropsWithChildren<FilterBarProps>) {
  return (
    <div className='mb-4 flex flex-wrap items-center gap-3 rounded border border-gray-300 bg-white p-4'>
      {children}
      {actions ? <div className='flex items-center gap-2'>{actions}</div> : null}
    </div>
  );
}
