import { useState } from 'react';

import { Button, DatePicker, Select, Tabs } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs, { Dayjs } from 'dayjs';
import { useQuery } from '@tanstack/react-query';

import DataTable from '@/components/common/DataTable';
import FilterBar from '@/components/common/FilterBar';
import PageHeader from '@/components/common/PageHeader';
import { PERMISSION_ACTION_LABEL, PERMISSION_ACTION_OPTIONS } from '@/constants/labels';
import { permissionLabel } from '@/constants/permission';
import { PermissionQueries } from '@/entities/permission';
import { getQueryString, usePageQuery } from '@/hooks/usePageQuery';
import { formatDateTime } from '@/utils/format';

import type {
  PermissionActionType,
  PermissionHistoryListParams,
  PermissionHistoryRow,
  PermissionRow,
} from '@/apis/permission';
import type { PermissionType } from '@/constants/permission';

const { RangePicker } = DatePicker;

function boolCell(value: boolean): string {
  return value ? 'O' : 'X';
}

const masterColumns: ColumnsType<PermissionRow> = [
  { title: '번호', dataIndex: 'id', width: 70, align: 'center' },
  { title: '권한자', dataIndex: 'name', width: 140, align: 'center' },
  {
    title: '권한자 역할',
    dataIndex: 'permissionType',
    width: 160,
    align: 'center',
    render: (value: PermissionType) => permissionLabel(value),
  },
  { title: '이용', dataIndex: 'canUse', width: 80, align: 'center', render: boolCell },
  { title: '제공', dataIndex: 'canProvide', width: 80, align: 'center', render: boolCell },
  { title: '파기', dataIndex: 'canDestroy', width: 80, align: 'center', render: boolCell },
  {
    title: '등록일시',
    dataIndex: 'regDt',
    width: 170,
    align: 'center',
    render: (value: string) => formatDateTime(value),
  },
];

const historyColumns: ColumnsType<PermissionHistoryRow> = [
  { title: '번호', dataIndex: 'id', width: 70, align: 'center' },
  {
    title: '대상자',
    key: 'target',
    width: 180,
    align: 'center',
    render: (_, row) => `${row.targetName} (${row.targetLoginId})`,
  },
  {
    title: '유형',
    dataIndex: 'actionType',
    width: 90,
    align: 'center',
    render: (value: PermissionActionType) => PERMISSION_ACTION_LABEL[value] ?? value,
  },
  {
    title: '이전 권한',
    dataIndex: 'beforePermission',
    width: 150,
    align: 'center',
    render: (value: PermissionType | null) => permissionLabel(value),
  },
  {
    title: '이후 권한',
    dataIndex: 'afterPermission',
    width: 150,
    align: 'center',
    render: (value: PermissionType | null) => permissionLabel(value),
  },
  {
    title: '수행자',
    key: 'actor',
    width: 180,
    align: 'center',
    render: (_, row) => `${row.actorName} (${row.actorLoginId})`,
  },
  { title: 'IP', dataIndex: 'ip', width: 150, align: 'center' },
  {
    title: '일시',
    dataIndex: 'regDt',
    width: 170,
    align: 'center',
    render: (value: string) => formatDateTime(value),
  },
];

export default function PermissionPage() {
  const { page, perPage, query, setPage, setQuery, applyFilter } = usePageQuery();

  const tab = getQueryString(query.tab) === 'history' ? 'history' : 'master';
  const isMaster = tab === 'master';

  const masterQuery = useQuery({ ...PermissionQueries.list({ page, perPage }), enabled: isMaster });

  const historyParams: PermissionHistoryListParams = {
    page,
    perPage,
    startDate: getQueryString(query.startDate),
    endDate: getQueryString(query.endDate),
    actionType: getQueryString(query.actionType) as PermissionActionType | undefined,
  };
  const historyQuery = useQuery({ ...PermissionQueries.histories(historyParams), enabled: !isMaster });

  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(() => {
    const start = getQueryString(query.startDate);
    const end = getQueryString(query.endDate);
    return start || end ? [start ? dayjs(start) : null, end ? dayjs(end) : null] : null;
  });
  const [actionType, setActionType] = useState<PermissionActionType | undefined>(
    getQueryString(query.actionType) as PermissionActionType | undefined,
  );

  const onSearch = () => {
    applyFilter({
      startDate: dateRange?.[0]?.format('YYYY-MM-DD'),
      endDate: dateRange?.[1]?.format('YYYY-MM-DD'),
      actionType,
    });
  };

  const onReset = () => {
    setDateRange(null);
    setActionType(undefined);
    applyFilter({ startDate: undefined, endDate: undefined, actionType: undefined });
  };

  return (
    <div>
      <PageHeader title='권한 관리' description='권한 마스터 현황과 부여/변경/말소 이력을 조회합니다.' />

      <Tabs
        activeKey={tab}
        onChange={(key) => setQuery({ tab: key, page: 1 })}
        items={[
          {
            key: 'master',
            label: '권한 마스터',
            children: (
              <DataTable<PermissionRow>
                columns={masterColumns}
                data={masterQuery.data?.list ?? []}
                meta={masterQuery.data?.meta}
                loading={masterQuery.isFetching}
                onPageChange={setPage}
              />
            ),
          },
          {
            key: 'history',
            label: '권한 이력',
            children: (
              <>
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
                  <Select<PermissionActionType>
                    placeholder='유형 전체'
                    allowClear
                    style={{ width: 140 }}
                    value={actionType}
                    onChange={(value) => setActionType(value)}
                    options={PERMISSION_ACTION_OPTIONS}
                  />
                </FilterBar>
                <DataTable<PermissionHistoryRow>
                  columns={historyColumns}
                  data={historyQuery.data?.list ?? []}
                  meta={historyQuery.data?.meta}
                  loading={historyQuery.isFetching}
                  onPageChange={setPage}
                />
              </>
            ),
          },
        ]}
      />
    </div>
  );
}
