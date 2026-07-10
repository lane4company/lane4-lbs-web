/** 파기 현황 */
export interface DestructionStatus {
  /** 원장(LBS_DRIVER_LOCATION) 건수 */
  locationCount: number;
  /** 백업(HISTORY) 건수 */
  historyCount: number;
  oldestRegDt: string | null;
  newestRegDt: string | null;
}

export interface BusinessClosedDestructionParams {
  /** 확인 문자열, 반드시 "데이터파기" */
  confirmText: string;
}

export interface BusinessClosedDestructionResult {
  /** 백업 처리된 건수 */
  backedUp: number;
  /** 삭제된 건수 */
  deleted: number;
  /** true 면 다른 인스턴스에서 백업/파기 작업이 진행 중이라 이번 요청은 스킵됨 */
  skipped: boolean;
}

export const DESTRUCTION_CONFIRM_TEXT = '데이터파기';
