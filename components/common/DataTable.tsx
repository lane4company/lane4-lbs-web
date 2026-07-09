import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { Key } from 'react';

import { DEFAULT_PER_PAGE, ListMeta } from '@/apis/type';

interface DataTableProps<T> {
  columns: ColumnsType<T>;
  data: T[];
  meta?: ListMeta;
  loading?: boolean;
  rowKey?: string | ((row: T) => Key);
  onPageChange?: (page: number, perPage: number) => void;
  /** 페이지네이션 숨김 (단건/상태 조회 등) */
  hidePagination?: boolean;
  /** 서버 meta 없이 antd 내장 페이지네이션 사용 (전체 반환 목록) */
  clientPagination?: boolean;
  /** clientPagination 시 페이지 크기 */
  pageSize?: number;
}

export default function DataTable<T extends object>({
  columns,
  data,
  meta,
  loading = false,
  rowKey = 'id',
  onPageChange,
  hidePagination = false,
  clientPagination = false,
  pageSize = DEFAULT_PER_PAGE,
}: DataTableProps<T>) {
  const showTotal = (total: number) => `총 ${total.toLocaleString('ko-KR')}건`;

  return (
    <Table<T>
      columns={columns}
      dataSource={data}
      loading={loading}
      rowKey={rowKey}
      size='middle'
      bordered
      scroll={{ x: 'max-content' }}
      locale={{ emptyText: '조회된 내역이 없습니다.' }}
      pagination={
        hidePagination
          ? false
          : clientPagination
            ? { pageSize, showSizeChanger: false, showTotal }
            : {
                current: meta?.currentPage ?? 1,
                pageSize: meta?.perPage ?? DEFAULT_PER_PAGE,
                total: meta?.totalCnt ?? 0,
                showSizeChanger: false,
                onChange: onPageChange,
                showTotal,
              }
      }
    />
  );
}
