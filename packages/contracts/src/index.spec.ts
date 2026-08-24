import { describe, expect, it } from 'vitest';
import type { ApiSuccess, ApiFailure } from './index';

describe('contract envelopes', () => {
  it('menerima payload sukses yang valid', () => {
    const res: ApiSuccess<{ id: string }> = {
      data: { id: 'uuid' },
      meta: { trace_id: 'trace-1', completeness: 'COMPLETE' },
      links: { self: '/api/v1/example' },
    };
    expect(res.data.id).toBe('uuid');
  });

  it('menerima payload gagal yang valid', () => {
    const res: ApiFailure = {
      error: { code: 'VALIDATION_ERROR', message: 'Periksa field yang ditandai.', trace_id: 'trace-1' },
    };
    expect(res.error.code).toBe('VALIDATION_ERROR');
  });
});
