import { ReactNode, useEffect } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { App, Input, Modal, Select } from 'antd';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { useCreateAdmin, useUpdateAdmin, useUpdateAdminPermission } from '@/entities/admin';
import { PERMISSION_OPTIONS, PermissionType } from '@/constants/permission';
import { PASSWORD_RULE_TEXT, passwordSchema } from '@/utils/password';

import type { AdminRow } from '@/apis/admin';

const MOBILE_REGEX = /^01[016789]-?\d{3,4}-?\d{4}$/;

const nameField = z.string().min(1, '이름을 입력해 주세요.');
const mobileField = z.string().regex(MOBILE_REGEX, '올바른 휴대폰 번호를 입력해 주세요.');

const createSchema = z.object({
  loginId: z.string().min(4, '아이디는 4자 이상이어야 합니다.').max(30),
  password: passwordSchema,
  name: nameField,
  mobile: mobileField,
  department: z.string().optional(),
  permissionType: z.enum(['OFFICER', 'MANAGER', 'HANDLER']),
});
type CreateForm = z.infer<typeof createSchema>;

const editSchema = z.object({
  name: nameField,
  mobile: mobileField,
  department: z.string().optional(),
});
type EditForm = z.infer<typeof editSchema>;

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <div className='mb-3'>
      <label className='mb-1 block text-sm font-medium text-gray-800'>{label}</label>
      {children}
      {error ? <p className='mt-1 text-xs text-point-danger'>{error}</p> : null}
    </div>
  );
}

// ── 계정 등록 ─────────────────────────────────────────────────
export function CreateAccountModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { message } = App.useApp();
  const createAdmin = useCreateAdmin();
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
    defaultValues: { loginId: '', password: '', name: '', mobile: '', department: undefined, permissionType: 'HANDLER' },
  });

  useEffect(() => {
    if (open) reset();
  }, [open, reset]);

  const submit = handleSubmit(async (values) => {
    try {
      await createAdmin.mutateAsync({ ...values, department: values.department?.trim() || undefined });
      message.success('계정이 등록되었습니다.');
      onClose();
    } catch (error) {
      message.error(error instanceof Error ? error.message : '계정 등록에 실패했습니다.');
    }
  });

  return (
    <Modal
      open={open}
      title='계정 등록'
      okText='등록'
      cancelText='취소'
      confirmLoading={createAdmin.isPending}
      onOk={submit}
      onCancel={onClose}
      destroyOnClose
    >
      <Field label='아이디' error={errors.loginId?.message}>
        <Controller control={control} name='loginId' render={({ field }) => <Input placeholder='아이디' {...field} />} />
      </Field>
      <Field label='초기 비밀번호' error={errors.password?.message}>
        <Controller
          control={control}
          name='password'
          render={({ field }) => <Input.Password placeholder='비밀번호' {...field} />}
        />
      </Field>
      <p className='mb-3 text-xs text-gray-600'>{PASSWORD_RULE_TEXT}</p>
      <Field label='이름' error={errors.name?.message}>
        <Controller control={control} name='name' render={({ field }) => <Input placeholder='이름' {...field} />} />
      </Field>
      <Field label='연락처' error={errors.mobile?.message}>
        <Controller
          control={control}
          name='mobile'
          render={({ field }) => <Input placeholder='010-0000-0000' {...field} />}
        />
      </Field>
      <Field label='부서(선택)' error={errors.department?.message}>
        <Controller
          control={control}
          name='department'
          render={({ field }) => (
            <Input
              placeholder='부서'
              value={field.value ?? ''}
              onChange={(event) => field.onChange(event.target.value || undefined)}
            />
          )}
        />
      </Field>
      <Field label='권한' error={errors.permissionType?.message}>
        <Controller
          control={control}
          name='permissionType'
          render={({ field }) => (
            <Select<PermissionType> style={{ width: '100%' }} options={PERMISSION_OPTIONS} {...field} />
          )}
        />
      </Field>
    </Modal>
  );
}

// ── 계정 수정 ─────────────────────────────────────────────────
export function EditAccountModal({
  open,
  admin,
  onClose,
}: {
  open: boolean;
  admin: AdminRow | null;
  onClose: () => void;
}) {
  const { message } = App.useApp();
  const updateAdmin = useUpdateAdmin();
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditForm>({
    resolver: zodResolver(editSchema),
    defaultValues: { name: '', mobile: '', department: undefined },
  });

  useEffect(() => {
    if (open && admin) {
      reset({ name: admin.name, mobile: admin.mobile, department: admin.department ?? undefined });
    }
  }, [open, admin, reset]);

  const submit = handleSubmit(async (values) => {
    if (!admin) return;
    try {
      await updateAdmin.mutateAsync({
        id: admin.adminId,
        name: values.name,
        mobile: values.mobile,
        department: values.department?.trim() || undefined,
      });
      message.success('계정 정보가 수정되었습니다.');
      onClose();
    } catch (error) {
      message.error(error instanceof Error ? error.message : '계정 수정에 실패했습니다.');
    }
  });

  return (
    <Modal
      open={open}
      title={`계정 수정 (${admin?.loginId ?? ''})`}
      okText='수정'
      cancelText='취소'
      confirmLoading={updateAdmin.isPending}
      onOk={submit}
      onCancel={onClose}
      destroyOnClose
    >
      <Field label='이름' error={errors.name?.message}>
        <Controller control={control} name='name' render={({ field }) => <Input placeholder='이름' {...field} />} />
      </Field>
      <Field label='연락처' error={errors.mobile?.message}>
        <Controller
          control={control}
          name='mobile'
          render={({ field }) => <Input placeholder='010-0000-0000' {...field} />}
        />
      </Field>
      <Field label='부서(선택)' error={errors.department?.message}>
        <Controller
          control={control}
          name='department'
          render={({ field }) => (
            <Input
              placeholder='부서'
              value={field.value ?? ''}
              onChange={(event) => field.onChange(event.target.value || undefined)}
            />
          )}
        />
      </Field>
    </Modal>
  );
}

// ── 권한 변경 ─────────────────────────────────────────────────
export function PermissionChangeModal({
  open,
  admin,
  onClose,
}: {
  open: boolean;
  admin: AdminRow | null;
  onClose: () => void;
}) {
  const { message } = App.useApp();
  const updatePermission = useUpdateAdminPermission();
  const { control, handleSubmit, reset } = useForm<{ permissionType: PermissionType }>({
    defaultValues: { permissionType: 'HANDLER' },
  });

  useEffect(() => {
    if (open && admin) reset({ permissionType: admin.permissionType });
  }, [open, admin, reset]);

  const submit = handleSubmit(async (values) => {
    if (!admin) return;
    try {
      await updatePermission.mutateAsync({ id: admin.adminId, permissionType: values.permissionType });
      message.success('권한이 변경되었습니다.');
      onClose();
    } catch (error) {
      message.error(error instanceof Error ? error.message : '권한 변경에 실패했습니다.');
    }
  });

  return (
    <Modal
      open={open}
      title={`권한 변경 (${admin?.name ?? ''})`}
      okText='변경'
      cancelText='취소'
      confirmLoading={updatePermission.isPending}
      onOk={submit}
      onCancel={onClose}
      destroyOnClose
    >
      <Field label='권한'>
        <Controller
          control={control}
          name='permissionType'
          render={({ field }) => (
            <Select<PermissionType> style={{ width: '100%' }} options={PERMISSION_OPTIONS} {...field} />
          )}
        />
      </Field>
    </Modal>
  );
}
