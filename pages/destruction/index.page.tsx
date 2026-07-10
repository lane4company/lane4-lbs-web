import { useState } from 'react';

import { Alert, App, Button, Descriptions, Input, Popconfirm, Result, Spin } from 'antd';
import { useQuery } from '@tanstack/react-query';

import { DESTRUCTION_CONFIRM_TEXT } from '@/apis/destruction';
import PageHeader from '@/components/common/PageHeader';
import { DestructionQueries, useDestroyBusinessClosed } from '@/entities/destruction';
import { formatDateTime, formatNumber } from '@/utils/format';

import type { BusinessClosedDestructionResult } from '@/apis/destruction';

export default function DestructionPage() {
  const { message } = App.useApp();
  const { data: status, isFetching } = useQuery(DestructionQueries.status());
  const destroy = useDestroyBusinessClosed();

  const [confirmText, setConfirmText] = useState('');
  const [result, setResult] = useState<BusinessClosedDestructionResult | null>(null);

  const confirmed = confirmText.trim() === DESTRUCTION_CONFIRM_TEXT;

  const onDestroy = async () => {
    try {
      const response = await destroy.mutateAsync({ confirmText: confirmText.trim() });
      setResult(response);
      setConfirmText('');
      if (response.skipped) {
        message.warning('다른 인스턴스에서 파기 작업이 진행 중입니다. 잠시 후 다시 시도해 주세요.');
      } else {
        message.success('데이터 일괄 파기가 완료되었습니다.');
      }
    } catch (error) {
      message.error(error instanceof Error ? error.message : '데이터 파기에 실패했습니다.');
    }
  };

  return (
    <div className='max-w-3xl'>
      <PageHeader title='데이터 일괄 파기' description='보존 목적이 종료된 위치정보를 일괄 파기합니다.' />

      <Alert
        type='error'
        showIcon
        className='mb-5'
        message='위험 작업'
        description='이 작업은 되돌릴 수 없습니다. 대상 데이터는 원장에서 완전히 삭제됩니다.'
      />

      <div className='mb-6 rounded border border-gray-300 bg-white p-5'>
        <h2 className='mb-3 text-base font-semibold text-navy-1000'>현재 파기 대상 현황</h2>
        {isFetching ? (
          <Spin />
        ) : (
          <Descriptions column={2} bordered size='small'>
            <Descriptions.Item label='원장 건수'>{formatNumber(status?.locationCount)}</Descriptions.Item>
            <Descriptions.Item label='최초 등록일시'>{formatDateTime(status?.oldestRegDt)}</Descriptions.Item>
            <Descriptions.Item label='최근 등록일시'>{formatDateTime(status?.newestRegDt)}</Descriptions.Item>
          </Descriptions>
        )}
      </div>

      <div className='rounded border border-point-danger/40 bg-white p-5'>
        <h2 className='mb-3 text-base font-semibold text-point-danger'>파기 실행</h2>
        <p className='mb-2 text-sm text-gray-700'>
          실행하려면 아래 입력란에 <strong className='text-point-danger'>{DESTRUCTION_CONFIRM_TEXT}</strong> 를 정확히
          입력하세요.
        </p>
        <Input
          placeholder={DESTRUCTION_CONFIRM_TEXT}
          value={confirmText}
          onChange={(event) => setConfirmText(event.target.value)}
          status={confirmText && !confirmed ? 'error' : undefined}
          className='mb-3'
          style={{ maxWidth: 260 }}
        />
        <div>
          <Popconfirm
            title='데이터 일괄 파기'
            description='정말로 파기를 실행하시겠습니까? 되돌릴 수 없습니다.'
            okText='실행'
            cancelText='취소'
            okButtonProps={{ danger: true }}
            disabled={!confirmed || destroy.isPending}
            onConfirm={onDestroy}
          >
            <Button danger type='primary' disabled={!confirmed} loading={destroy.isPending}>
              일괄 파기 실행
            </Button>
          </Popconfirm>
        </div>
      </div>

      {result ? (
        result.skipped ? (
          <Result
            className='mt-6'
            status='warning'
            title='작업이 스킵되었습니다'
            subTitle='다른 인스턴스에서 파기 작업이 진행 중입니다. 잠시 후 다시 시도해 주세요.'
          />
        ) : (
          <Result
            className='mt-6'
            status='success'
            title='데이터 파기 완료'
            subTitle={`삭제 ${formatNumber(result.deleted)}건 처리되었습니다.`}
          />
        )
      ) : null}
    </div>
  );
}
