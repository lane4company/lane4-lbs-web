import { AxiosV2 } from '@/utils/AxiosV2';

import type { ListData } from '@/apis/type';
import type { AccessLogListParams, AccessLogRow } from '@/apis/accessLog/accessLog.type';

export class AccessLogService {
  static async getList(params: AccessLogListParams): Promise<ListData<AccessLogRow>> {
    return AxiosV2.GET<ListData<AccessLogRow>, AccessLogListParams>({ url: 'lbs/v2/access-logs', params }).then(
      (res) => res.data,
    );
  }
}
