import { describe, expect, it } from 'vitest';
import { validateEnv } from './env-validation';

const VALID_DB = 'postgresql://user:password@localhost:5432/dashboard_divisi';

describe('validateEnv', () => {
  it('menerima environment minimal dan menerapkan default', () => {
    const config = validateEnv({ DATABASE_URL: VALID_DB });
    expect(config.NODE_ENV).toBe('local');
    expect(config.PORT).toBe(3000);
    expect(config.DATABASE_URL).toBe(VALID_DB);
  });

  it('menerima nilai eksplisit yang valid', () => {
    const config = validateEnv({ NODE_ENV: 'staging', PORT: '8080', DATABASE_URL: VALID_DB });
    expect(config.NODE_ENV).toBe('staging');
    expect(config.PORT).toBe(8080);
  });

  it('menerima NODE_ENV test untuk kebutuhan automated test', () => {
    const config = validateEnv({ NODE_ENV: 'test', DATABASE_URL: VALID_DB });
    expect(config.NODE_ENV).toBe('test');
  });

  it('menolak NODE_ENV di luar nilai yang diizinkan', () => {
    expect(() => validateEnv({ NODE_ENV: 'production', DATABASE_URL: VALID_DB })).toThrow(/NODE_ENV/);
  });

  it('menolak PORT non-numerik', () => {
    expect(() => validateEnv({ PORT: 'bukan-port', DATABASE_URL: VALID_DB })).toThrow(/PORT/);
  });

  it('menolak PORT di luar rentang 1-65535', () => {
    expect(() => validateEnv({ PORT: '70000', DATABASE_URL: VALID_DB })).toThrow(/PORT/);
  });

  it('menolak DATABASE_URL kosong', () => {
    expect(() => validateEnv({ DATABASE_URL: '' })).toThrow(/DATABASE_URL/);
  });

  it('menolak DATABASE_URL bukan postgres', () => {
    expect(() => validateEnv({ DATABASE_URL: 'mysql://user@localhost/db' })).toThrow(/DATABASE_URL/);
  });

  it('me-list semua variabel bermasalah sekaligus', () => {
    try {
      validateEnv({ NODE_ENV: 'salah', PORT: '0', DATABASE_URL: '' });
      expect.unreachable();
    } catch (error) {
      const message = (error as Error).message;
      expect(message).toContain('NODE_ENV');
      expect(message).toContain('PORT');
      expect(message).toContain('DATABASE_URL');
    }
  });
});
