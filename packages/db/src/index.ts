export const DB_PACKAGE_VERSION = '0.1.0' as const;

export function isPrismaSchemaReady(): boolean {
  return true;
}

export { PrismaClient } from '@prisma/client';
export * from '@prisma/client';
