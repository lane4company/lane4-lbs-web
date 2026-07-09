import { AxiosV2 } from '@/utils/AxiosV2';

import type {
  BusinessClosedDestructionParams,
  BusinessClosedDestructionResult,
  DestructionStatus,
} from '@/apis/destruction/destruction.type';

export class DestructionService {
  static async getStatus(): Promise<DestructionStatus> {
    return AxiosV2.GET<DestructionStatus>({ url: 'lbs/v2/destruction/status' }).then((res) => res.data);
  }

  /** 휴폐업 일괄 파기 (백업 후 삭제) */
  static async destroyBusinessClosed(
    params: BusinessClosedDestructionParams,
  ): Promise<BusinessClosedDestructionResult> {
    return AxiosV2.POST<BusinessClosedDestructionResult, BusinessClosedDestructionParams>({
      url: 'lbs/v2/destruction/business-closed',
      params,
    }).then((res) => res.data);
  }
}
