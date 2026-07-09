import { useMemo, useState } from 'react';

import { App, Button, Popconfirm, Select, Space, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useQuery } from '@tanstack/react-query';

import DataTable from '@/components/common/DataTable';
import FilterBar from '@/components/common/FilterBar';
import PageHeader from '@/components/common/PageHeader';
import IpFormModal from '@/components/ip/IpFormModal';
import { IP_CONTROL_TYPE_LABEL, IP_CONTROL_TYPE_OPTIONS } from '@/constants/labels';
import { IpControlQueries, useRemoveIpControl } from '@/entities/ipControl';
import { formatDateTime } from '@/utils/format';

import type { IpControlRow, IpControlType, UseYn } from '@/apis/ipControl';

export default function IpControlPage() {
  const { message } = App.useApp();

  // 서버는 전체 반환 → 유형 필터/페이지네이션은 클라이언트에서 처리
  const [type, setType] = useState<IpControlType | undefined>(undefined);
  const [appliedType, setAppliedType] = useState<IpControlType | undefined>(undefined);

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<IpControlRow | null>(null);

  const { data, isFetching } = useQuery(IpControlQueries.list());
  const removeIpControl = useRemoveIpControl();

  const filtered = useMemo<IpControlRow[]>(() => {
    const list: IpControlRow[] = data ?? [];
    return appliedType ? list.filter((row) => row.ipType === appliedType) : list;
  }, [data, appliedType]);

  const openCreate = () => {
    setEditTarget(null);
    setFormOpen(true);
  };

  const openEdit = (row: IpControlRow) => {
    setEditTarget(row);
    setFormOpen(true);
  };

  const onRemove = async (row: IpControlRow) => {
    try {
      await removeIpControl.mutateAsync(row.id);
      message.success('IP 통제 규칙이 삭제되었습니다.');
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'IP 통제 규칙 삭제에 실패했습니다.');
    }
  };

  const columns: ColumnsType<IpControlRow> = [
    { title: '번호', dataIndex: 'id', width: 70, align: 'center' },
    { title: 'IP / CIDR', dataIndex: 'ipAddress', width: 200, align: 'center' },
    {
      title: '유형',
      dataIndex: 'ipType',
      width: 130,
      align: 'center',
      render: (value: IpControlType) => (
        <Tag color={value === 'WHITE' ? 'blue' : 'red'}>{IP_CONTROL_TYPE_LABEL[value]}</Tag>
      ),
    },
    { title: '설명', dataIndex: 'description', render: (value: string | null) => value ?? '-' },
    {
      title: '활성',
      dataIndex: 'useYn',
      width: 90,
      align: 'center',
      render: (value: UseYn) => <Tag color={value === 'Y' ? 'green' : 'default'}>{value === 'Y' ? '활성' : '비활성'}</Tag>,
    },
    {
      title: '등록일시',
      dataIndex: 'regDt',
      width: 170,
      align: 'center',
      render: (value: string) => formatDateTime(value),
    },
    {
      title: '수정일시',
      dataIndex: 'updDt',
      width: 170,
      align: 'center',
      render: (value: string | null) => (value ? formatDateTime(value) : '-'),
    },
    {
      title: '관리',
      key: 'action',
      width: 150,
      align: 'center',
      render: (_, row) => (
        <Space size='small'>
          <Button size='small' onClick={() => openEdit(row)}>
            수정
          </Button>
          <Popconfirm
            title='규칙 삭제'
            description='이 IP 통제 규칙을 삭제하시겠습니까?'
            okText='삭제'
            cancelText='취소'
            okButtonProps={{ danger: true }}
            onConfirm={() => onRemove(row)}
          >
            <Button size='small' danger>
              삭제
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title='IP 관리'
        description='관리시스템 접근을 허용/차단하는 IP 화이트·블랙리스트를 관리합니다.'
        actions={
          <Button type='primary' onClick={openCreate}>
            규칙 등록
          </Button>
        }
      />

      <FilterBar
        actions={
          <>
            <Button
              onClick={() => {
                setType(undefined);
                setAppliedType(undefined);
              }}
            >
              초기화
            </Button>
            <Button type='primary' onClick={() => setAppliedType(type)}>
              검색
            </Button>
          </>
        }
      >
        <Select<IpControlType>
          placeholder='유형 전체'
          allowClear
          style={{ width: 180 }}
          value={type}
          onChange={(value) => setType(value)}
          options={IP_CONTROL_TYPE_OPTIONS}
        />
      </FilterBar>

      <DataTable<IpControlRow> columns={columns} data={filtered} loading={isFetching} rowKey='id' clientPagination />

      <IpFormModal open={formOpen} target={editTarget} onClose={() => setFormOpen(false)} />
    </div>
  );
}
