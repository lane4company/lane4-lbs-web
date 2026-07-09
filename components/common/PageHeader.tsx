import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  /** 우측 액션 영역 (버튼 등) */
  actions?: ReactNode;
}

export default function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className='mb-5 flex items-end justify-between'>
      <div>
        <h1 className='text-xl font-semibold text-navy-1000'>{title}</h1>
        {description ? <p className='mt-1 text-sm text-gray-600'>{description}</p> : null}
      </div>
      {actions ? <div className='flex items-center gap-2'>{actions}</div> : null}
    </div>
  );
}
