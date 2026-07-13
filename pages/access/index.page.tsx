import { useState } from 'react';

import { Button, DatePicker, Input, Select, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs, { Dayjs } from 'dayjs';
import { useQuery } from '@tanstack/react-query';

import DataTable from '@/components/common/DataTable';
import FilterBar from '@/components/common/FilterBar';
import PageHeader from '@/components/common/PageHeader';
import { ACCESS_TYPE_LABEL, ACCESS_TYPE_OPTIONS } from '@/constants/labels';
import { permissionLabel } from '@/constants/permission';
import { AccessLogQueries } from '@/entities/accessLog';
import { getQueryString, usePageQuery } from '@/hooks/usePageQuery';
import { formatDateTime } from '@/utils/format';

import type { AccessLogListParams, AccessLogRow, AccessResult, AccessType } from '@/apis/accessLog';
import type { PermissionType } from '@/constants/permission';

const { RangePicker } = DatePicker;

const columns: ColumnsType<AccessLogRow> = [
  {
    title: '접근일시',
    dataIndex: 'accessDt',
    width: 180,
    align: 'center',
    render: (value: string) => formatDateTime(value),
  },
  {
    title: '접근권한',
    dataIndex: 'permissionType',
    width: 150,
    align: 'center',
    render: (value: PermissionType) => permissionLabel(value),
  },
  { title: '이름', dataIndex: 'name', width: 120, align: 'center' },
  { title: 'ID', dataIndex: 'loginId', width: 140, align: 'center' },
  {
    title: '항목',
    dataIndex: 'accessType',
    width: 130,
    align: 'center',
    render: (value: AccessType) => ACCESS_TYPE_LABEL[value] ?? value,
  },
  { title: '내용', dataIndex: 'description', render: (value: string | null) => value ?? '-' },
  {
    title: '결과',
    dataIndex: 'result',
    width: 90,
    align: 'center',
    render: (value: AccessResult) => (
      <Tag color={value === 'SUCCESS' ? 'green' : 'red'}>{value === 'SUCCESS' ? '성공' : '실패'}</Tag>
    ),
  },
  { title: '접근 IP', dataIndex: 'ip', width: 150, align: 'center' },
];

export default function AccessPage() {
  const { page, perPage, query, setPage, applyFilter } = usePageQuery();

  const params: AccessLogListParams = {
    page,
    perPage,
    startDate: getQueryString(query.startDate),
    endDate: getQueryString(query.endDate),
    accessType: getQueryString(query.accessType) as AccessType | undefined,
    loginId: getQueryString(query.loginId),
  };

  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(() => {
    const start = getQueryString(query.startDate);
    const end = getQueryString(query.endDate);
    return start || end ? [start ? dayjs(start) : null, end ? dayjs(end) : null] : null;
  });
  const [accessType, setAccessType] = useState<AccessType | undefined>(
    getQueryString(query.accessType) as AccessType | undefined,
  );
  const [loginId, setLoginId] = useState(getQueryString(query.loginId) ?? '');

  const { data, isFetching } = useQuery(AccessLogQueries.list(params));

  const onSearch = () => {
    applyFilter({
      startDate: dateRange?.[0]?.format('YYYY-MM-DD'),
      endDate: dateRange?.[1]?.format('YYYY-MM-DD'),
      accessType,
      loginId: loginId.trim() || undefined,
    });
  };

  const onReset = () => {
    setDateRange(null);
    setAccessType(undefined);
    setLoginId('');
    applyFilter({ startDate: undefined, endDate: undefined, accessType: undefined, loginId: undefined });
  };

  return (
    <div>
      <PageHeader title='시스템 접근기록' description='관리시스템 로그인/조회/다운로드 등 접근 이력을 조회합니다.' />

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
        <RangePicker
          value={dateRange}
          onChange={(value) => setDateRange(value as [Dayjs | null, Dayjs | null] | null)}
          allowEmpty={[true, true]}
        />
        <Select<AccessType>
          placeholder='접근유형 전체'
          allowClear
          style={{ width: 180 }}
          value={accessType}
          onChange={(value) => setAccessType(value)}
          options={ACCESS_TYPE_OPTIONS}
        />
        <Input
          placeholder='ID'
          style={{ width: 160 }}
          value={loginId}
          onChange={(event) => setLoginId(event.target.value)}
          onPressEnter={onSearch}
          allowClear
        />
      </FilterBar>

      <DataTable<AccessLogRow>
        columns={columns}
        data={data?.list ?? []}
        meta={data?.meta}
        loading={isFetching}
        onPageChange={setPage}
      />
    </div>
  );
}
