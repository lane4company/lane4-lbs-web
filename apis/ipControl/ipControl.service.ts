import { AxiosV2 } from '@/utils/AxiosV2';

import type {
  IpControlCreateParams,
  IpControlRow,
  IpControlUpdateParams,
} from '@/apis/ipControl/ipControl.type';

export class IpControlService {
  /** 전체 IP 통제 목록 (meta 없음, data.list) */
  static async getList(): Promise<IpControlRow[]> {
    return AxiosV2.GET<{ list: IpControlRow[] }>({ url: 'lbs/v2/ip-controls' }).then((res) => res.data.list);
  }

  static async create(params: IpControlCreateParams): Promise<boolean> {
    return AxiosV2.POST<boolean, IpControlCreateParams>({ url: 'lbs/v2/ip-controls', params }).then((res) => res.data);
  }

  static async update({ id, ...params }: IpControlUpdateParams): Promise<boolean> {
    return AxiosV2.PUT<boolean, Omit<IpControlUpdateParams, 'id'>>({ url: `lbs/v2/ip-controls/${id}`, params }).then(
      (res) => res.data,
    );
  }

  static async remove(id: number): Promise<boolean> {
    return AxiosV2.DELETE<boolean>({ url: `lbs/v2/ip-controls/${id}` }).then((res) => res.data);
  }
}
