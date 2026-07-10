import { Descriptions } from 'antd';
import { useSession } from 'next-auth/react';

import PageHeader from '@/components/common/PageHeader';
import PasswordChangeForm from '@/components/common/PasswordChangeForm';
import { permissionLabel } from '@/constants/permission';
import { formatDateTime } from '@/utils/format';

export default function MyInfoPage() {
  const { data: session } = useSession();
  const admin = session?.admin;

  return (
    <div className='max-w-2xl'>
      <PageHeader title='내 정보' description='로그인한 계정 정보를 확인하고 비밀번호를 변경합니다.' />

      <div className='mb-6 rounded border border-gray-300 bg-white p-5'>
        <h2 className='mb-3 text-base font-semibold text-navy-1000'>계정 정보</h2>
        <Descriptions column={1} bordered size='small'>
          <Descriptions.Item label='이름'>{admin?.name ?? '-'}</Descriptions.Item>
          <Descriptions.Item label='아이디'>{admin?.loginId ?? '-'}</Descriptions.Item>
          <Descriptions.Item label='권한'>{permissionLabel(admin?.permissionType)}</Descriptions.Item>
          <Descriptions.Item label='접속시간'>{formatDateTime(session?.loginAt)}</Descriptions.Item>
        </Descriptions>
      </div>

      <div className='rounded border border-gray-300 bg-white p-5'>
        <h2 className='mb-3 text-base font-semibold text-navy-1000'>비밀번호 변경</h2>
        <PasswordChangeForm />
      </div>
    </div>
  );
}
