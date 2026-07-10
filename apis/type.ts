/**
 * admin-api lbs/v2/* 공통 응답 계약.
 * 모든 응답은 CommonResponse 로 래핑되고, 목록 응답의 data 는 { list, meta } 형태다.
 */
export interface CommonResponse<T> {
  result: boolean;
  code: string | number | null;
  data: T;
}

export interface ListMeta {
  currentPage: number;
  perPage: number;
  totalCount: number;
  totalPage: number;
}

export interface ListData<T> {
  list: T[];
  meta: ListMeta;
}

export interface PageParams {
  page?: number;
  perPage?: number;
}

export const DEFAULT_PER_PAGE = 20;
