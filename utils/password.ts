import { z } from 'zod';

const LETTER = /[A-Za-z]/;
const DIGIT = /[0-9]/;
const SPECIAL = /[^A-Za-z0-9]/;

/** 사용된 문자 종류 수(영문/숫자/특수문자) */
function countCharKinds(value: string): number {
  let kinds = 0;
  if (LETTER.test(value)) kinds += 1;
  if (DIGIT.test(value)) kinds += 1;
  if (SPECIAL.test(value)) kinds += 1;
  return kinds;
}

/**
 * 비밀번호 정책:
 * - 영문/숫자/특수문자 중 3종 이상 조합 → 8자리 이상
 * - 2종 조합 → 10자리 이상
 */
export function isValidPassword(value: string): boolean {
  const kinds = countCharKinds(value);
  if (kinds >= 3 && value.length >= 8) return true;
  if (kinds >= 2 && value.length >= 10) return true;
  return false;
}

export const PASSWORD_RULE_TEXT =
  '영문·숫자·특수문자 중 2종 이상 조합 10자리 이상, 또는 3종 이상 조합 8자리 이상이어야 합니다.';

export const passwordSchema = z.string().refine(isValidPassword, { message: PASSWORD_RULE_TEXT });

/** 비밀번호 변경 폼 스키마 */
export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, '현재 비밀번호를 입력해 주세요.'),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, '새 비밀번호 확인을 입력해 주세요.'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: '새 비밀번호가 일치하지 않습니다.',
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: '현재 비밀번호와 다른 비밀번호를 사용해 주세요.',
    path: ['newPassword'],
  });

export type PasswordChangeForm = z.infer<typeof passwordChangeSchema>;
