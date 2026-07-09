import { AxiosV2 } from '@/utils/AxiosV2';

import type { ListData } from '@/apis/type';
import type {
  PermissionHistoryListParams,
  PermissionHistoryRow,
  PermissionListParams,
  PermissionRow,
} from '@/apis/permission/permission.type';

export class PermissionService {
  /** 권한 마스터 목록 (전체 권한) */
  static async getList(params: PermissionListParams): Promise<ListData<PermissionRow>> {
    return AxiosV2.GET<ListData<PermissionRow>, PermissionListParams>({ url: 'lbs/v2/permissions', params }).then(
      (res) => res.data,
    );
  }

  /** 권한 부여/변경/말소 이력 (MANAGER+) */
  static async getHistories(params: PermissionHistoryListParams): Promise<ListData<PermissionHistoryRow>> {
    return AxiosV2.GET<ListData<PermissionHistoryRow>, PermissionHistoryListParams>({
      url: 'lbs/v2/permissions/histories',
      params,
    }).then((res) => res.data);
  }
}
