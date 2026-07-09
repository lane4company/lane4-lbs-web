import { AxiosV2 } from '@/utils/AxiosV2';

import type {
  AdminCreateParams,
  AdminPermissionUpdateParams,
  AdminRow,
  AdminUpdateParams,
} from '@/apis/admin/admin.type';

export class AdminService {
  /** 전체 관리자 목록 (meta 없음, data.list) */
  static async getList(): Promise<AdminRow[]> {
    return AxiosV2.GET<{ list: AdminRow[] }>({ url: 'lbs/v2/admins' }).then((res) => res.data.list);
  }

  static async create(params: AdminCreateParams): Promise<boolean> {
    return AxiosV2.POST<boolean, AdminCreateParams>({ url: 'lbs/v2/admins', params }).then((res) => res.data);
  }

  static async update({ id, ...params }: AdminUpdateParams): Promise<boolean> {
    return AxiosV2.PUT<boolean, Omit<AdminUpdateParams, 'id'>>({ url: `lbs/v2/admins/${id}`, params }).then(
      (res) => res.data,
    );
  }

  /** 권한 변경 (LBS_PERMISSION_HIST 기록) */
  static async updatePermission({ id, ...params }: AdminPermissionUpdateParams): Promise<boolean> {
    return AxiosV2.PUT<boolean, Omit<AdminPermissionUpdateParams, 'id'>>({
      url: `lbs/v2/admins/${id}/permission`,
      params,
    }).then((res) => res.data);
  }

  /** 잠금 해제 (body 없음) */
  static async unlock(id: number): Promise<boolean> {
    return AxiosV2.PUT<boolean>({ url: `lbs/v2/admins/${id}/unlock` }).then((res) => res.data);
  }

  /** 말소 (STATUS=DELETED + REVOKE 이력) */
  static async remove(id: number): Promise<boolean> {
    return AxiosV2.DELETE<boolean>({ url: `lbs/v2/admins/${id}` }).then((res) => res.data);
  }
}
