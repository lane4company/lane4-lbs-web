import axios, { AxiosRequestConfig } from 'axios';

import type { CommonResponse } from '@/apis/type';

import ApiClient from './UserService';

interface AxiosProps<D> {
  url: string;
  params?: D;
  formData?: D;
  config?: AxiosRequestConfig<D>;
  fileName?: string;
}

const DEFAULT_ERROR_MESSAGE = '서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.';

/**
 * admin-api 에러 응답을 일관된 형태로 감싼 에러.
 * UI 는 error.message / error.code 로 사용자 메시지를 노출한다.
 */
export class ReservedError extends Error {
  code: string | number | null;
  result: boolean;

  constructor(code: string | number | null, message: string, result = false) {
    super(message);
    this.name = 'ReservedError';
    this.code = code;
    this.result = result;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/** CommonResponse / { message } / string 등 다양한 에러 바디에서 사람이 읽을 메시지를 추출 */
function resolveErrorMessage(payload: unknown): string | undefined {
  if (typeof payload === 'string') return payload;
  if (!isRecord(payload)) return undefined;

  const target = 'data' in payload ? payload.data : payload;
  if (typeof target === 'string') return target;

  if (isRecord(target) && 'message' in target) {
    const message = target.message;
    if (Array.isArray(message)) return message.join(' / ');
    if (typeof message === 'string') return message;
  }

  if ('message' in payload && typeof payload.message === 'string') {
    return payload.message;
  }
  return undefined;
}

function toReservedError(error: unknown): ReservedError {
  if (axios.isAxiosError(error)) {
    const body = error.response?.data;
    const code =
      (isRecord(body) && 'code' in body ? (body.code as string | number | null) : null) ??
      error.response?.status ??
      error.code ??
      null;
    const message = resolveErrorMessage(body) ?? DEFAULT_ERROR_MESSAGE;
    const result = isRecord(body) && 'result' in body ? Boolean(body.result) : false;
    return new ReservedError(code, message, result);
  }
  if (error instanceof Error) return new ReservedError(null, error.message);
  return new ReservedError(null, DEFAULT_ERROR_MESSAGE);
}

async function GET<T, D = unknown>({ url, params, config }: AxiosProps<D>): Promise<CommonResponse<T>> {
  try {
    const response = await ApiClient.get<CommonResponse<T>>(`/${url}`, { params, ...config });
    return response.data;
  } catch (error) {
    throw toReservedError(error);
  }
}

async function POST<T, D = unknown>({ url, params, config }: AxiosProps<D>): Promise<CommonResponse<T>> {
  try {
    const response = await ApiClient.post<CommonResponse<T>>(`/${url}`, params, config);
    return response.data;
  } catch (error) {
    throw toReservedError(error);
  }
}

async function PUT<T, D = unknown>({ url, params, config }: AxiosProps<D>): Promise<CommonResponse<T>> {
  try {
    const response = await ApiClient.put<CommonResponse<T>>(`/${url}`, params, config);
    return response.data;
  } catch (error) {
    throw toReservedError(error);
  }
}

async function DELETE<T, D = unknown>({ url, params, config }: AxiosProps<D>): Promise<CommonResponse<T>> {
  try {
    const response = await ApiClient.delete<CommonResponse<T>>(`/${url}`, { data: params, ...config });
    return response.data;
  } catch (error) {
    throw toReservedError(error);
  }
}

async function EXCEL<D = unknown>({ url, params, config, fileName }: AxiosProps<D>): Promise<void> {
  try {
    const response = await ApiClient.get<Blob>(`/${url}`, { params, responseType: 'blob', ...config });
    const blob = new Blob([response.data]);
    const href = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.setAttribute('download', `${fileName ?? url}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(href);
  } catch (error) {
    throw toReservedError(error);
  }
}

export const AxiosV2 = {
  GET,
  POST,
  PUT,
  DELETE,
  EXCEL,
};
