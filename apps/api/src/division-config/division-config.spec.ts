/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from 'vitest';
import { DivisionConfigService } from './division-config.service';

describe('BOD-05 DivisionConfig — config-driven tanpa deploy', () => {
  it('getAllConfigs fallback 7 divisi tanpa DB', async () => {
    const mockPrisma = {
      divisionConfig: { findMany: async () => [] },
      division: { findMany: async () => [] },
    } as any;
    const service = new DivisionConfigService(mockPrisma);
    const configs = await service.getAllConfigs();
    expect(configs.length).toBe(7);
    expect(configs.map((c) => c.divisionCode)).toEqual(['WRAP', 'CELL', 'REFL', 'MINI', 'FNB', 'FIN', 'MC']);
  });

  it('MC hanya punya forex, tidak revenue.gross', async () => {
    // Simplified: directly test getConfig fallback
    const service = new DivisionConfigService({
      division: { findUnique: async () => ({ id: 'mc-id', code: 'MC', name: 'Money Changer', isActive: true }) },
      divisionConfig: {
        findUnique: async () => ({
          enabledModules: ['dashboard', 'forex'],
          enabledKpis: ['forex.volume', 'forex.spread'],
          isActive: true,
          division: { code: 'MC', name: 'Money Changer', isActive: true },
        }),
      },
    } as any);
    const cfg = await service.getConfig('MC');
    expect(cfg!.enabledModules).toContain('forex');
    expect(cfg!.enabledModules).not.toContain('revenue');
    expect(cfg!.enabledKpis).toContain('forex.volume');
  });

  it('divisi baru tanpa deploy: createDivisionWithConfig', async () => {
    let createdDivision: any = null;
    let createdConfig: any = null;
    const mockPrisma = {
      division: {
        create: async (args: any) => {
          createdDivision = args.data;
          return { id: 'new-id', ...args.data };
        },
      },
      divisionConfig: {
        create: async (args: any) => {
          createdConfig = args.data;
          return { id: 'cfg-id', ...args.data };
        },
      },
    } as any;
    const service = new DivisionConfigService(mockPrisma);
    const result = await service.createDivisionWithConfig('NEW', 'New Division', ['dashboard'], ['custom.kpi']);
    expect(result.division.code).toBe('NEW');
    expect(createdDivision.code).toBe('NEW');
    expect(createdConfig.enabledModules).toEqual(['dashboard']);
  });

  it('shell sama untuk divisi baru — config-driven', async () => {
    // Verifikasi bahwa frontend shell tidak perlu ubah code untuk divisi baru, cukup config
    const service = new DivisionConfigService({
      division: { findUnique: async () => ({ id: 'new-id', code: 'NEW', name: 'New Division', isActive: true }) },
      divisionConfig: {
        findUnique: async () => null, // no config yet -> fallback
        findMany: async () => [],
      },
    } as any);
    const cfg = await service.getConfig('NEW');
    // jika tidak ada config, tetap return dengan enabledModules kosong, shell tetap render (tidak crash)
    expect(cfg).toBeDefined();
    expect(cfg!.divisionCode).toBe('NEW');
  });
});
