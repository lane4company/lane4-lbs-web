import type { PermissionType } from '@/constants/permission';

/** 로그인한 LBS 관리자 정보 (sms/verify 응답 + 세션에 노출) */
export interface LbsAdmin {
  adminId: number;
  loginId: string;
  name: string;
  permissionType: PermissionType;
  /** 노출 가능 메뉴 키 콤마 문자열 (예: "provision,access,account") */
  menuScope: string;
}

/** access token payload */
export interface LbsJwtPayload {
  adminId: number;
  loginId: string;
  name: string;
  permissionType: PermissionType;
  exp: number;
  iat: number;
}

// ── 1단계: ID/PW ──────────────────────────────────────────────
export interface LoginParams {
  loginId: string;
  password: string;
}

export interface LoginResult {
  mfaToken: string;
  expiresInSec: number;
  /** 마스킹된 수신 휴대폰 번호 (010-****-1234) */
  mobileMasked: string;
}

// ── 2단계: SMS 인증 ───────────────────────────────────────────
export interface SmsVerifyParams {
  mfaToken: string;
  authCode: string;
}

export interface SmsVerifyResult {
  accessToken: string;
  refreshToken: string;
  mustChangePassword: boolean;
  admin: LbsAdmin;
}

export interface SmsResendParams {
  mfaToken: string;
}

export interface SmsResendResult {
  expiresInSec: number;
}

// ── 토큰 갱신 ─────────────────────────────────────────────────
export interface RefreshParams {
  refreshToken: string;
}

export interface RefreshResult {
  accessToken: string;
  refreshToken: string;
}

// ── 비밀번호 변경 ─────────────────────────────────────────────
export interface PasswordChangeParams {
  currentPassword: string;
  newPassword: string;
}
