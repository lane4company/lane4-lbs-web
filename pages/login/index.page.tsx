import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';

import { App, Button, Form, Input } from 'antd';
import { getSession, signIn, useSession } from 'next-auth/react';

import { AuthService } from '@/apis/auth';
import { useResendSms } from '@/entities/auth';
import { formatMmSs } from '@/utils/format';

import type { LoginResult } from '@/apis/auth';
import type { NextPageWithLayout } from '@/types/page';

interface Step1FormValues {
  loginId: string;
  password: string;
}

const AUTH_CODE_LENGTH = 6;

const LoginPage: NextPageWithLayout = () => {
  const router = useRouter();
  const { message } = App.useApp();
  const { status } = useSession();

  const [step, setStep] = useState<'credentials' | 'sms'>('credentials');
  const [mfa, setMfa] = useState<LoginResult | null>(null);
  const [authCode, setAuthCode] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const resendSms = useResendSms();

  // 이미 로그인된 상태로 접근 시 이동
  useEffect(() => {
    if (status === 'authenticated') {
      void router.replace('/provision');
    }
  }, [status, router]);

  // 인증번호 유효시간 카운트다운
  useEffect(() => {
    if (step !== 'sms' || secondsLeft <= 0) return;
    const timer = window.setInterval(() => setSecondsLeft((prev) => Math.max(0, prev - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [step, secondsLeft]);

  const onSubmitCredentials = async (values: Step1FormValues) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const result = await AuthService.login(values);
      setMfa(result);
      setSecondsLeft(result.expiresInSec);
      setAuthCode('');
      setStep('sms');
    } catch (error) {
      message.error(error instanceof Error ? error.message : '로그인에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const onVerify = useCallback(async () => {
    if (!mfa || submitting) return;
    if (authCode.length !== AUTH_CODE_LENGTH) {
      message.warning(`인증번호 ${AUTH_CODE_LENGTH}자리를 입력해 주세요.`);
      return;
    }
    if (secondsLeft <= 0) {
      message.warning('인증번호 유효시간이 만료되었습니다. 재발송해 주세요.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await signIn('lbs-login', {
        mfaToken: mfa.mfaToken,
        authCode,
        redirect: false,
      });

      if (!response || response.error) {
        message.error(response?.error || '인증에 실패했습니다.');
        return;
      }

      const session = await getSession();
      if (session?.mustChangePassword) {
        await router.replace('/password-change');
      } else {
        await router.replace('/provision');
      }
    } finally {
      setSubmitting(false);
    }
  }, [mfa, submitting, authCode, secondsLeft, message, router]);

  const onResend = async () => {
    if (!mfa) return;
    try {
      const result = await resendSms.mutateAsync({ mfaToken: mfa.mfaToken });
      setSecondsLeft(result.expiresInSec);
      setAuthCode('');
      message.success('인증번호를 재발송했습니다.');
    } catch (error) {
      message.error(error instanceof Error ? error.message : '재발송에 실패했습니다.');
    }
  };

  return (
    <div className='flex min-h-screen items-center justify-center bg-navy-1000'>
      <div className='w-[380px] rounded-lg bg-white p-10 shadow-lg'>
        <div className='mb-8 text-center'>
          <p className='text-2xl font-bold text-navy-1000'>LANE4</p>
          <h1 className='mt-1 text-base font-medium text-gray-700'>위치정보 관리시스템</h1>
        </div>

        {step === 'credentials' ? (
          <Form<Step1FormValues> layout='vertical' onFinish={onSubmitCredentials} requiredMark={false}>
            <Form.Item label='아이디' name='loginId' rules={[{ required: true, message: '아이디를 입력해 주세요.' }]}>
              <Input size='large' autoComplete='username' placeholder='아이디' />
            </Form.Item>
            <Form.Item
              label='비밀번호'
              name='password'
              rules={[{ required: true, message: '비밀번호를 입력해 주세요.' }]}
            >
              <Input.Password size='large' autoComplete='current-password' placeholder='비밀번호' />
            </Form.Item>
            <Button type='primary' htmlType='submit' size='large' block loading={submitting}>
              로그인
            </Button>
          </Form>
        ) : (
          <div className='flex flex-col gap-4'>
            <p className='text-sm text-gray-700'>
              <span className='font-medium text-navy-1000'>{mfa?.mobileMasked}</span> 로 전송된 인증번호
              {AUTH_CODE_LENGTH}자리를 입력해 주세요.
            </p>
            <div>
              <Input
                size='large'
                value={authCode}
                maxLength={AUTH_CODE_LENGTH}
                inputMode='numeric'
                placeholder='인증번호 6자리'
                onChange={(event) => setAuthCode(event.target.value.replace(/\D/g, ''))}
                onPressEnter={onVerify}
                suffix={
                  <span className={secondsLeft <= 30 ? 'text-point-danger' : 'text-gray-600'}>
                    {formatMmSs(secondsLeft * 1000)}
                  </span>
                }
              />
              <div className='mt-2 flex justify-end'>
                <Button type='link' size='small' onClick={onResend} loading={resendSms.isPending}>
                  인증번호 재발송
                </Button>
              </div>
            </div>
            <Button type='primary' size='large' block loading={submitting} onClick={onVerify}>
              인증 확인
            </Button>
            <Button
              type='text'
              size='small'
              onClick={() => {
                setStep('credentials');
                setMfa(null);
                setAuthCode('');
              }}
            >
              이전으로
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

LoginPage.getLayout = (page) => page;

export default LoginPage;
