export const ALLOWED_NODE_ENVIRONMENTS = ['local', 'test', 'staging'] as const;

export type NodeEnvironment = (typeof ALLOWED_NODE_ENVIRONMENTS)[number];

export interface AppConfig {
  NODE_ENV: NodeEnvironment;
  PORT: number;
  DATABASE_URL: string;
  JWT_SECRET: string;
}

function collectEnvErrors(config: Record<string, unknown>): string[] {
  const errors: string[] = [];

  const nodeEnvRaw = config.NODE_ENV ?? 'local';
  if (
    typeof nodeEnvRaw !== 'string' ||
    !ALLOWED_NODE_ENVIRONMENTS.includes(nodeEnvRaw as NodeEnvironment)
  ) {
    errors.push(
      `NODE_ENV harus salah satu dari ${ALLOWED_NODE_ENVIRONMENTS.join(', ')} (diterima: ${String(nodeEnvRaw)})`,
    );
  }

  const portRaw = config.PORT ?? '3000';
  const port = Number(portRaw);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    errors.push(`PORT harus bilangan bulat 1-65535 (diterima: ${String(portRaw)})`);
  }

  const dbUrlRaw = config.DATABASE_URL;
  const isTest = nodeEnvRaw === 'test';
  if (typeof dbUrlRaw !== 'string' || dbUrlRaw.trim() === '') {
    if (!isTest) {
      errors.push('DATABASE_URL wajib diisi (contoh: postgresql://user:password@localhost:5432/dashboard_divisi)');
    }
  } else if (!dbUrlRaw.startsWith('postgresql://') && !dbUrlRaw.startsWith('postgres://')) {
    errors.push(`DATABASE_URL harus diawali postgresql:// atau postgres:// (diterima: ${String(dbUrlRaw).slice(0, 20)}...)`);
  }

  const jwtRaw = config.JWT_SECRET;
  if (typeof jwtRaw !== 'string' || jwtRaw.trim() === '') {
    if (!isTest) {
      errors.push('JWT_SECRET wajib diisi (minimal 32 karakter, contoh: ganti-jwt-secret-min-32-karakter-di-env-lokal)');
    }
  } else if (jwtRaw.trim().length < 32) {
    errors.push(`JWT_SECRET minimal 32 karakter (diterima: ${String(jwtRaw).length} karakter)`);
  }

  return errors;
}

export function validateEnv(config: Record<string, unknown>): AppConfig {
  const errors = collectEnvErrors(config);

  if (errors.length > 0) {
    throw new Error(`Validasi environment gagal:\n- ${errors.join('\n- ')}`);
  }

  const databaseUrl =
    typeof config.DATABASE_URL === 'string' && config.DATABASE_URL.trim() !== ''
      ? String(config.DATABASE_URL)
      : 'postgresql://user:password@localhost:5432/dashboard_divisi_test';

  const jwtSecret =
    typeof config.JWT_SECRET === 'string' && config.JWT_SECRET.trim() !== ''
      ? String(config.JWT_SECRET)
      : 'test-jwt-secret-min-32-karakter-untuk-automated-test-1234';

  return {
    NODE_ENV: (config.NODE_ENV ?? 'local') as NodeEnvironment,
    PORT: Number(config.PORT ?? '3000'),
    DATABASE_URL: databaseUrl,
    JWT_SECRET: jwtSecret,
  };
}
