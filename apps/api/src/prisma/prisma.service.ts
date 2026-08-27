import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@dashboard-divisi/db';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    // In test without real DB, don't fail hard — auth service will be mocked or DB not hit for health tests
    try {
      await this.$connect();
    } catch (e) {
      if (process.env.NODE_ENV !== 'test') throw e;
      console.warn('[PrismaService] DB connect skipped in test', (e as Error).message?.slice(0, 80));
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
