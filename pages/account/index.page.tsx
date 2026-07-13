import { useState } from 'react';

import { App, Button, Input, Popconfirm, Select, Space, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useQuery } from '@tanstack/react-query';

import { CreateAccountModal, EditAccountModal, PermissionChangeModal } from '@/components/account/AccountModals';
import DataTable from '@/components/common/DataTable';
import FilterBar from '@/components/common/FilterBar';
import PageHeader from '@/components/common/PageHeader';
import { ADMIN_STATUS_LABEL } from '@/constants/labels';
import { PERMISSION_OPTIONS, permissionLabel } from '@/constants/permission';
import { AdminQueries, useRemoveAdmin, useUnlockAdmin } from '@/entities/admin';
import { formatDateTime } from '@/utils/format';

import type { AdminRow, AdminStatus } from '@/apis/admin';
import type { PermissionType } from '@/constants/permission';

const STATUS_COLOR: Record<AdminStatus, string> = {
  ACTIVE: 'green',
  LOCKED: 'orange',
  DELETED: 'red',
};

const STATUS_OPTIONS: Array<{ label: string; value: AdminStatus }> = (
  Object.keys(ADMIN_STATUS_LABEL) as AdminStatus[]
).map((value) => ({ value, label: ADMIN_STATUS_LABEL[value] }));

interface AppliedFilter {
  keyword: string;
  permissionType?: PermissionType;
  status?: AdminStatus;
}

export default function AccountPage() {
  const { message } = App.useApp();

  // 필터는 서버측 처리, 페이지네이션만 클라이언트(DataTable clientPagination)
  const [keyword, setKeyword] = useState('');
  const [permissionType, setPermissionType] = useState<PermissionType | undefined>(undefined);
  const [status, setStatus] = useState<AdminStatus | undefined>(undefined);
  const [applied, setApplied] = useState<AppliedFilter>({ keyword: '' });

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminRow | null>(null);
  const [permissionTarget, setPermissionTarget] = useState<AdminRow | null>(null);

  const { data, isFetching } = useQuery(AdminQueries.list(applied));
  const unlockAdmin = useUnlockAdmin();
  const removeAdmin = useRemoveAdmin();

  const onSearch = () => setApplied({ keyword, permissionType, status });

  const onReset = () => {
    setKeyword('');
    setPermissionType(undefined);
    setStatus(undefined);
    setApplied({ keyword: '' });
  };

  const onUnlock = async (row: AdminRow) => {
    try {
      await unlockAdmin.mutateAsync(row.adminId);
      message.success('잠금이 해제되었습니다.');
    } catch (error) {
      message.error(error instanceof Error ? error.message : '잠금 해제에 실패했습니다.');
    }
  };

  const onRemove = async (row: AdminRow) => {
    try {
      await removeAdmin.mutateAsync(row.adminId);
      message.success('계정이 제거되었습니다.');
    } catch (error) {
      message.error(error instanceof Error ? error.message : '계정 제거에 실패했습니다.');
    }
  };

  const columns: ColumnsType<AdminRow> = [
    { title: '번호', dataIndex: 'adminId', width: 70, align: 'center' },
    {
      title: '등록일시',
      dataIndex: 'regDt',
      width: 160,
      align: 'center',
      render: (value: string) => formatDateTime(value),
    },
    {
      title: '접근권한',
      dataIndex: 'permissionType',
      width: 140,
      align: 'center',
      render: (value: PermissionType) => permissionLabel(value),
    },
    { title: '이름', dataIndex: 'name', width: 100, align: 'center' },
    { title: 'ID', dataIndex: 'loginId', width: 130, align: 'center' },
    { title: '연락처', dataIndex: 'mobile', width: 140, align: 'center' },
    { title: '부서', dataIndex: 'department', width: 120, align: 'center', render: (value: string | null) => value ?? '-' },
    {
      title: '최근 로그인',
      dataIndex: 'lastLoginAt',
      width: 160,
      align: 'center',
      render: (value: string | null) => (value ? formatDateTime(value) : '-'),
    },
    {
      title: '상태',
      dataIndex: 'status',
      width: 90,
      align: 'center',
      render: (value: AdminStatus, row) => (
        <Tag color={STATUS_COLOR[value]}>
          {ADMIN_STATUS_LABEL[value]}
          {value === 'LOCKED' && row.loginFailCount > 0 ? ` (${row.loginFailCount})` : ''}
        </Tag>
      ),
    },
    {
      title: '삭제일시',
      dataIndex: 'deletedAt',
      width: 160,
      align: 'center',
      render: (value: string | null) => (value ? formatDateTime(value) : '-'),
    },
    {
      title: '관리',
      key: 'action',
      width: 260,
      align: 'center',
      render: (_, row) => {
        if (row.status === 'DELETED') return <span className='text-gray-500'>-</span>;
        return (
          <Space size='small'>
            <Button size='small' onClick={() => setEditTarget(row)}>
              수정
            </Button>
            <Button size='small' onClick={() => setPermissionTarget(row)}>
              권한변경
            </Button>
            {row.status === 'LOCKED' ? (
              <Button size='small' onClick={() => onUnlock(row)}>
                잠금해제
              </Button>
            ) : null}
            <Popconfirm
              title='계정 제거'
              description='이 계정을 제거하시겠습니까?'
              okText='제거'
              cancelText='취소'
              okButtonProps={{ danger: true }}
              onConfirm={() => onRemove(row)}
            >
              <Button size='small' danger>
                제거
              </Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title='계정 관리'
        description='LBS 관리자 계정을 등록/수정하고 권한 변경·잠금 해제·제거를 관리합니다.'
        actions={
          <Button type='primary' onClick={() => setCreateOpen(true)}>
            계정 등록
          </Button>
        }
      />

      <FilterBar
        actions={
          <>
            <Button onClick={onReset}>초기화</Button>
            <Button type='primary' onClick={onSearch}>
              검색
            </Button>
          </>
        }
      >
        <Input
          placeholder='이름 / ID'
          style={{ width: 180 }}
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          onPressEnter={onSearch}
          allowClear
        />
        <Select<PermissionType>
          placeholder='권한 전체'
          allowClear
          style={{ width: 180 }}
          value={permissionType}
          onChange={(value) => setPermissionType(value)}
          options={PERMISSION_OPTIONS}
        />
        <Select<AdminStatus>
          placeholder='상태 전체'
          allowClear
          style={{ width: 140 }}
          value={status}
          onChange={(value) => setStatus(value)}
          options={STATUS_OPTIONS}
        />
      </FilterBar>

      <DataTable<AdminRow>
        columns={columns}
        data={data ?? []}
        loading={isFetching}
        rowKey='adminId'
        clientPagination
      />

      <CreateAccountModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <EditAccountModal open={Boolean(editTarget)} admin={editTarget} onClose={() => setEditTarget(null)} />
      <PermissionChangeModal
        open={Boolean(permissionTarget)}
        admin={permissionTarget}
        onClose={() => setPermissionTarget(null)}
      />
    </div>
  );
}
