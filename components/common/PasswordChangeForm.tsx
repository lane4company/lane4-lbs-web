import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, App, Button, Input } from 'antd';
import { signOut } from 'next-auth/react';
import { Controller, useForm } from 'react-hook-form';

import { useChangePassword } from '@/entities/auth';
import { PASSWORD_RULE_TEXT, passwordChangeSchema } from '@/utils/password';

import type { PasswordChangeForm as PasswordChangeFormValues } from '@/utils/password';

/** 비밀번호 변경 폼 (현재/새/확인 비밀번호). 성공 시 재로그인을 위해 로그아웃 처리한다. */
export default function PasswordChangeForm() {
  const { message } = App.useApp();
  const changePassword = useChangePassword();
  const [done, setDone] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordChangeFormValues>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
    mode: 'onBlur',
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await changePassword.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      setDone(true);
      message.success('비밀번호가 변경되었습니다. 다시 로그인해 주세요.');
      window.setTimeout(() => void signOut({ redirect: true, callbackUrl: '/login' }), 1500);
    } catch (error) {
      message.error(error instanceof Error ? error.message : '비밀번호 변경에 실패했습니다.');
    }
  });

  return (
    <form onSubmit={onSubmit} className='flex flex-col gap-4'>
      <Alert type='info' showIcon message='비밀번호 규칙' description={PASSWORD_RULE_TEXT} />

      <div>
        <label className='mb-1 block text-sm font-medium text-gray-800'>현재 비밀번호</label>
        <Controller
          control={control}
          name='currentPassword'
          render={({ field }) => <Input.Password size='large' placeholder='현재 비밀번호' {...field} />}
        />
        {errors.currentPassword ? (
          <p className='mt-1 text-xs text-point-danger'>{errors.currentPassword.message}</p>
        ) : null}
      </div>

      <div>
        <label className='mb-1 block text-sm font-medium text-gray-800'>새 비밀번호</label>
        <Controller
          control={control}
          name='newPassword'
          render={({ field }) => <Input.Password size='large' placeholder='새 비밀번호' {...field} />}
        />
        {errors.newPassword ? <p className='mt-1 text-xs text-point-danger'>{errors.newPassword.message}</p> : null}
      </div>

      <div>
        <label className='mb-1 block text-sm font-medium text-gray-800'>새 비밀번호 확인</label>
        <Controller
          control={control}
          name='confirmPassword'
          render={({ field }) => <Input.Password size='large' placeholder='새 비밀번호 확인' {...field} />}
        />
        {errors.confirmPassword ? (
          <p className='mt-1 text-xs text-point-danger'>{errors.confirmPassword.message}</p>
        ) : null}
      </div>

      <Button type='primary' htmlType='submit' size='large' block loading={changePassword.isPending} disabled={done}>
        비밀번호 변경
      </Button>
    </form>
  );
}
