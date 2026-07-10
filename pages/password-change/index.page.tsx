import PasswordChangeForm from '@/components/common/PasswordChangeForm';

import type { NextPageWithLayout } from '@/types/page';

const PasswordChangePage: NextPageWithLayout = () => {
  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-100'>
      <div className='w-[420px] rounded-lg bg-white p-10 shadow-lg'>
        <h1 className='mb-2 text-xl font-semibold text-navy-1000'>비밀번호 변경</h1>
        <p className='mb-5 text-sm text-gray-600'>보안 정책에 따라 비밀번호를 변경해 주세요.</p>

        <PasswordChangeForm />
      </div>
    </div>
  );
};

PasswordChangePage.getLayout = (page) => page;

export default PasswordChangePage;
