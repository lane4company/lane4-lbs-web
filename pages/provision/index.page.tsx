import { useState } from 'react';

import { App, Button, DatePicker, Input, Select, Tabs } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs, { Dayjs } from 'dayjs';
import { useQuery } from '@tanstack/react-query';

import { LocationService } from '@/apis/location';
import DataTable from '@/components/common/DataTable';
import FilterBar from '@/components/common/FilterBar';
import PageHeader from '@/components/common/PageHeader';
import { EVENT_TYPE_LABEL, EVENT_TYPE_OPTIONS, sourceLabel } from '@/constants/labels';
import { LocationQueries } from '@/entities/location';
import { getQueryString, usePageQuery } from '@/hooks/usePageQuery';
import { formatCoordinate, formatDateTime } from '@/utils/format';

import type { LbsEventType, LocationHistoryRow, LocationListParams, LocationRow } from '@/apis/location';

const { RangePicker } = DatePicker;

function coordinateCell(latitude: number, longitude: number): string {
  return `${formatCoordinate(latitude)}, ${formatCoordinate(longitude)}`;
}

const ledgerColumns: ColumnsType<LocationRow> = [
  { title: '번호', dataIndex: 'id', width: 80, align: 'center' },
  {
    title: '이벤트구분',
    dataIndex: 'eventType',
    width: 100,
    align: 'center',
    render: (value: LbsEventType) => EVENT_TYPE_LABEL[value] ?? value,
  },
  { title: '회원명(기사)', dataIndex: 'driverName', width: 110, align: 'center' },
  { title: '연락처', dataIndex: 'driverMobile', width: 140, align: 'center' },
  { title: '취득경로', dataIndex: 'acquirePath', width: 140, align: 'center' },
  { title: '제공받는자', dataIndex: 'receiver', width: 180 },
  { title: '제공서비스', dataIndex: 'providedService', width: 200 },
  {
    title: '좌표',
    key: 'coordinate',
    width: 200,
    align: 'center',
    render: (_, row) => coordinateCell(row.latitude, row.longitude),
  },
  {
    title: '출처',
    dataIndex: 'source',
    width: 140,
    align: 'center',
    render: (value: string) => sourceLabel(value),
  },
  {
    title: '등록일시',
    dataIndex: 'regDt',
    width: 170,
    align: 'center',
    render: (value: string) => formatDateTime(value),
  },
];

const historyColumns: ColumnsType<LocationHistoryRow> = [
  { title: '번호', dataIndex: 'id', width: 80, align: 'center' },
  {
    title: '이벤트구분',
    dataIndex: 'eventType',
    width: 100,
    align: 'center',
    render: (value: LbsEventType) => EVENT_TYPE_LABEL[value] ?? value,
  },
  { title: '취득경로', dataIndex: 'acquirePath', width: 140, align: 'center' },
  { title: '제공받는자', dataIndex: 'receiver', width: 180 },
  { title: '제공서비스', dataIndex: 'providedService', width: 200 },
  {
    title: '좌표',
    key: 'coordinate',
    width: 200,
    align: 'center',
    render: (_, row) => coordinateCell(row.latitude, row.longitude),
  },
  {
    title: '출처',
    dataIndex: 'source',
    width: 140,
    align: 'center',
    render: (value: string) => sourceLabel(value),
  },
  { title: '백업사유', dataIndex: 'backupReason', width: 150, align: 'center' },
  {
    title: '백업일시',
    dataIndex: 'backupDt',
    width: 170,
    align: 'center',
    render: (value: string) => formatDateTime(value),
  },
  {
    title: '등록일시',
    dataIndex: 'regDt',
    width: 170,
    align: 'center',
    render: (value: string) => formatDateTime(value),
  },
];

export default function ProvisionPage() {
  const { message } = App.useApp();
  const { page, perPage, query, setPage, setQuery, applyFilter } = usePageQuery();

  const tab = getQueryString(query.tab) === 'history' ? 'history' : 'ledger';
  const isLedger = tab === 'ledger';

  const params: LocationListParams = {
    page,
    perPage,
    startDate: getQueryString(query.startDate),
    endDate: getQueryString(query.endDate),
    driverName: getQueryString(query.driverName),
    eventType: getQueryString(query.eventType) as LbsEventType | undefined,
  };

  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(() => {
    const start = getQueryString(query.startDate);
    const end = getQueryString(query.endDate);
    return start || end ? [start ? dayjs(start) : null, end ? dayjs(end) : null] : null;
  });
  const [driverName, setDriverName] = useState(getQueryString(query.driverName) ?? '');
  const [eventType, setEventType] = useState<LbsEventType | undefined>(
    getQueryString(query.eventType) as LbsEventType | undefined,
  );
  const [downloading, setDownloading] = useState(false);

  const ledgerQuery = useQuery({ ...LocationQueries.list(params), enabled: isLedger });
  const historyQuery = useQuery({ ...LocationQueries.histories(params), enabled: !isLedger });

  const onSearch = () => {
    applyFilter({
      startDate: dateRange?.[0]?.format('YYYY-MM-DD'),
      endDate: dateRange?.[1]?.format('YYYY-MM-DD'),
      driverName: driverName.trim() || undefined,
      eventType,
    });
  };

  const onReset = () => {
    setDateRange(null);
    setDriverName('');
    setEventType(undefined);
    applyFilter({ startDate: undefined, endDate: undefined, driverName: undefined, eventType: undefined });
  };

  const onExcelDownload = async () => {
    setDownloading(true);
    try {
      await LocationService.downloadExcel(params);
    } catch (error) {
      message.error(error instanceof Error ? error.message : '엑셀 다운로드에 실패했습니다.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title='위치정보 제공기록'
        description='기사앱 위치정보 수집 원장 및 백업(파기) 이력을 조회합니다.'
        actions={
          isLedger ? (
            <Button type='primary' loading={downloading} onClick={onExcelDownload}>
              엑셀 다운로드
            </Button>
          ) : null
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
        <RangePicker
          value={dateRange}
          onChange={(value) => setDateRange(value as [Dayjs | null, Dayjs | null] | null)}
          allowEmpty={[true, true]}
        />
        <Select<LbsEventType>
          placeholder='이벤트구분 전체'
          allowClear
          style={{ width: 160 }}
          value={eventType}
          onChange={(value) => setEventType(value)}
          options={EVENT_TYPE_OPTIONS}
        />
        <Input
          placeholder='기사명'
          style={{ width: 160 }}
          value={driverName}
          onChange={(event) => setDriverName(event.target.value)}
          onPressEnter={onSearch}
          allowClear
        />
      </FilterBar>

      <Tabs
        activeKey={tab}
        onChange={(key) => setQuery({ tab: key, page: 1 })}
        items={[
          {
            key: 'ledger',
            label: '수집 원장',
            children: (
              <DataTable<LocationRow>
                columns={ledgerColumns}
                data={ledgerQuery.data?.list ?? []}
                meta={ledgerQuery.data?.meta}
                loading={ledgerQuery.isFetching}
                onPageChange={setPage}
              />
            ),
          },
          {
            key: 'history',
            label: '백업 이력',
            children: (
              <DataTable<LocationHistoryRow>
                columns={historyColumns}
                data={historyQuery.data?.list ?? []}
                meta={historyQuery.data?.meta}
                loading={historyQuery.isFetching}
                onPageChange={setPage}
              />
            ),
          },
        ]}
      />
    </div>
  );
}
