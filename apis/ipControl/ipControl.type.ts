/** IP 통제 유형 */
export type IpControlType = 'WHITE' | 'BLACK';

export type UseYn = 'Y' | 'N';

/** GET /lbs/v2/ip-controls 행 (전체 반환, 페이지네이션 없음 / 엔티티 그대로) */
export interface IpControlRow {
  id: number;
  ipType: IpControlType;
  ipAddress: string;
  description: string | null;
  useYn: UseYn;
  regAdminId: number | null;
  regDt: string;
  updDt: string | null;
}

/** 클라이언트 측 목록 필터 (서버는 전체 반환) */
export interface IpControlListFilter {
  ipType?: IpControlType;
}

export interface IpControlCreateParams {
  ipType: IpControlType;
  ipAddress: string;
  description?: string;
  // useYn 은 서버에서 자동 'Y'
}

export interface IpControlUpdateParams {
  /** path */
  id: number;
  ipType?: IpControlType;
  ipAddress?: string;
  description?: string;
  useYn?: UseYn;
}
