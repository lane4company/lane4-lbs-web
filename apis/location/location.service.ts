import { AxiosV2 } from '@/utils/AxiosV2';

import type { ListData } from '@/apis/type';
import type {
  LocationHistoryListParams,
  LocationHistoryRow,
  LocationListParams,
  LocationRow,
} from '@/apis/location/location.type';

export class LocationService {
  /** 수집 원장 목록 */
  static async getList(params: LocationListParams): Promise<ListData<LocationRow>> {
    return AxiosV2.GET<ListData<LocationRow>, LocationListParams>({ url: 'lbs/v2/locations', params }).then(
      (res) => res.data,
    );
  }

  /** 백업(HISTORY) 목록 */
  static async getHistories(params: LocationHistoryListParams): Promise<ListData<LocationHistoryRow>> {
    return AxiosV2.GET<ListData<LocationHistoryRow>, LocationHistoryListParams>({
      url: 'lbs/v2/locations/histories',
      params,
    }).then((res) => res.data);
  }

  /** 원장 엑셀 다운로드 (blob) */
  static async downloadExcel(params: LocationListParams): Promise<void> {
    return AxiosV2.EXCEL<LocationListParams>({
      url: 'lbs/v2/locations/excel',
      params,
      fileName: `위치정보_제공기록_${params.startDate ?? ''}_${params.endDate ?? ''}`,
    });
  }
}
