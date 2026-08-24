export const ALLOWED_NODE_ENVIRONMENTS = ['local', 'test', 'staging'] as const;

export type NodeEnvironment = (typeof ALLOWED_NODE_ENVIRONMENTS)[number];

export interface AppConfig {
  NODE_ENV: NodeEnvironment;
  PORT: number;
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

  return errors;
}

export function validateEnv(config: Record<string, unknown>): AppConfig {
  const errors = collectEnvErrors(config);

  if (errors.length > 0) {
    throw new Error(`Validasi environment gagal:\n- ${errors.join('\n- ')}`);
  }

  return {
    NODE_ENV: (config.NODE_ENV ?? 'local') as NodeEnvironment,
    PORT: Number(config.PORT ?? '3000'),
  };
}
