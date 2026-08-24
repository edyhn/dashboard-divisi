import { describe, expect, it } from 'vitest';
import { validateEnv } from './env-validation';

describe('validateEnv', () => {
  it('menerima environment minimal dan menerapkan default', () => {
    const config = validateEnv({});
    expect(config.NODE_ENV).toBe('local');
    expect(config.PORT).toBe(3000);
  });

  it('menerima nilai eksplisit yang valid', () => {
    const config = validateEnv({ NODE_ENV: 'staging', PORT: '8080' });
    expect(config.NODE_ENV).toBe('staging');
    expect(config.PORT).toBe(8080);
  });

  it('menerima NODE_ENV test untuk kebutuhan automated test', () => {
    const config = validateEnv({ NODE_ENV: 'test' });
    expect(config.NODE_ENV).toBe('test');
  });

  it('menolak NODE_ENV di luar nilai yang diizinkan', () => {
    expect(() => validateEnv({ NODE_ENV: 'production' })).toThrow(/NODE_ENV/);
  });

  it('menolak PORT non-numerik', () => {
    expect(() => validateEnv({ PORT: 'bukan-port' })).toThrow(/PORT/);
  });

  it('menolak PORT di luar rentang 1-65535', () => {
    expect(() => validateEnv({ PORT: '70000' })).toThrow(/PORT/);
  });

  it('me-list semua variabel bermasalah sekaligus', () => {
    try {
      validateEnv({ NODE_ENV: 'salah', PORT: '0' });
      expect.unreachable();
    } catch (error) {
      const message = (error as Error).message;
      expect(message).toContain('NODE_ENV');
      expect(message).toContain('PORT');
    }
  });
});
