import type { FieldError } from '@dashboard-divisi/contracts';

export const API_ERROR_HTTP_STATUS = {
  VALIDATION_ERROR: 400,
  AUTH_REQUIRED: 401,
  FORBIDDEN_CAPABILITY: 403,
  SCOPE_VIOLATION: 403,
  RESOURCE_NOT_FOUND: 404,
  INVALID_STATE_TRANSITION: 409,
  VERSION_CONFLICT: 409,
  IDEMPOTENCY_CONFLICT: 409,
  IMPORT_ROW_INVALID: 422,
  APPROVAL_SELF_ACTION_DENIED: 422,
  SOURCE_DATA_UNAVAILABLE: 422,
  RATE_LIMITED: 429,
  INTERNAL_ERROR: 500,
} as const;

export type ApiErrorCode = keyof typeof API_ERROR_HTTP_STATUS;

export class ApiError extends Error {
  readonly httpStatus: number;
  readonly code: ApiErrorCode;
  readonly fields?: FieldError[];

  constructor(code: ApiErrorCode, message: string, fields?: FieldError[]) {
    super(message);
    this.name = 'ApiError';
    this.httpStatus = API_ERROR_HTTP_STATUS[code];
    this.code = code;
    this.fields = fields;
  }
}