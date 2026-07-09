import { ReactNode, useEffect } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { App, Input, Modal, Select, Switch } from 'antd';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { IP_CONTROL_TYPE_OPTIONS } from '@/constants/labels';
import { useCreateIpControl, useUpdateIpControl } from '@/entities/ipControl';

import type { IpControlRow, IpControlType } from '@/apis/ipControl';

const IP_REGEX = /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/;

const schema = z.object({
  ipAddress: z
    .string()
    .regex(IP_REGEX, '올바른 IP 또는 CIDR 형식이 아닙니다. (예: 192.168.0.1 또는 10.0.0.0/24)')
    .refine(
      (value) =>
        value
          .split('/')[0]
          .split('.')
          .every((octet) => Number(octet) <= 255),
      { message: 'IP 각 자리는 255 이하여야 합니다.' },
    ),
  ipType: z.enum(['WHITE', 'BLACK']),
  description: z.string().max(200, '설명은 200자 이내로 입력해 주세요.').optional(),
  active: z.boolean(),
});
type IpForm = z.infer<typeof schema>;

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <div className='mb-3'>
      <label className='mb-1 block text-sm font-medium text-gray-800'>{label}</label>
      {children}
      {error ? <p className='mt-1 text-xs text-point-danger'>{error}</p> : null}
    </div>
  );
}

export default function IpFormModal({
  open,
  target,
  onClose,
}: {
  open: boolean;
  target: IpControlRow | null;
  onClose: () => void;
}) {
  const { message } = App.useApp();
  const createIpControl = useCreateIpControl();
  const updateIpControl = useUpdateIpControl();
  const isEdit = Boolean(target);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<IpForm>({
    resolver: zodResolver(schema),
    defaultValues: { ipAddress: '', ipType: 'WHITE', description: undefined, active: true },
  });

  useEffect(() => {
    if (!open) return;
    if (target) {
      reset({
        ipAddress: target.ipAddress,
        ipType: target.ipType,
        description: target.description ?? undefined,
        active: target.useYn === 'Y',
      });
    } else {
      reset({ ipAddress: '', ipType: 'WHITE', description: undefined, active: true });
    }
  }, [open, target, reset]);

  const submit = handleSubmit(async (values) => {
    const description = values.description?.trim() || undefined;
    try {
      if (target) {
        await updateIpControl.mutateAsync({
          id: target.id,
          ipType: values.ipType,
          ipAddress: values.ipAddress,
          description,
          useYn: values.active ? 'Y' : 'N',
        });
        message.success('IP 통제 규칙이 수정되었습니다.');
      } else {
        // 등록 시 useYn 은 서버에서 자동 'Y'
        await createIpControl.mutateAsync({ ipType: values.ipType, ipAddress: values.ipAddress, description });
        message.success('IP 통제 규칙이 등록되었습니다.');
      }
      onClose();
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'IP 통제 규칙 저장에 실패했습니다.');
    }
  });

  return (
    <Modal
      open={open}
      title={isEdit ? 'IP 통제 규칙 수정' : 'IP 통제 규칙 등록'}
      okText={isEdit ? '수정' : '등록'}
      cancelText='취소'
      confirmLoading={createIpControl.isPending || updateIpControl.isPending}
      onOk={submit}
      onCancel={onClose}
      destroyOnClose
    >
      <Field label='IP / CIDR' error={errors.ipAddress?.message}>
        <Controller
          control={control}
          name='ipAddress'
          render={({ field }) => <Input placeholder='192.168.0.1 또는 10.0.0.0/24' {...field} />}
        />
      </Field>
      <Field label='유형' error={errors.ipType?.message}>
        <Controller
          control={control}
          name='ipType'
          render={({ field }) => (
            <Select<IpControlType> style={{ width: '100%' }} options={IP_CONTROL_TYPE_OPTIONS} {...field} />
          )}
        />
      </Field>
      <Field label='설명(선택)' error={errors.description?.message}>
        <Controller
          control={control}
          name='description'
          render={({ field }) => (
            <Input.TextArea
              placeholder='설명'
              rows={2}
              value={field.value ?? ''}
              onChange={(event) => field.onChange(event.target.value || undefined)}
            />
          )}
        />
      </Field>
      {isEdit ? (
        <Field label='활성 여부'>
          <Controller
            control={control}
            name='active'
            render={({ field }) => (
              <Switch
                checked={field.value}
                onChange={field.onChange}
                checkedChildren='활성'
                unCheckedChildren='비활성'
              />
            )}
          />
        </Field>
      ) : null}
    </Modal>
  );
}
