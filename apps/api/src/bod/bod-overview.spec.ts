/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from 'vitest';
import { BodOverviewService } from './bod-overview.service';

describe('BOD-02 Overview — sumber/periode/freshness/drill-down', () => {
  it('overview 7 divisi dengan sumber, periode, freshness, drillDown', async () => {
    const mockPrisma = {
      division: {
        findMany: async () => [
          { code: 'WRAP', name: 'Wrapping', updatedAt: new Date('2024-01-15T10:00:00Z') },
          { code: 'CELL', name: 'Cellular', updatedAt: new Date('2024-01-15T10:00:00Z') },
          { code: 'REFL', name: 'Refleksi', updatedAt: new Date('2024-01-15T10:00:00Z') },
          { code: 'MINI', name: 'Minimarket', updatedAt: new Date('2024-01-15T10:00:00Z') },
          { code: 'FNB', name: 'FnB', updatedAt: new Date('2024-01-15T10:00:00Z') },
          { code: 'FIN', name: 'Finance', updatedAt: new Date('2024-01-15T10:00:00Z') },
          { code: 'MC', name: 'Money Changer', updatedAt: new Date('2024-01-15T10:00:00Z') },
        ],
      },
    } as any;
    const mockReadModel = {} as any;
    const service = new BodOverviewService(mockPrisma, mockReadModel);

    const overview = await service.getOverview('2024-01-01', '2024-01-31');
    expect(overview.length).toBe(7);
    for (const item of overview) {
      expect(item.period.from).toBe('2024-01-01');
      expect(item.period.to).toBe('2024-01-31');
      expect(item.revenue.source).toBeDefined();
      expect(item.target.source).toBeDefined();
      expect(item.performance.source).toBeDefined();
      expect(item.workforce.source).toBeDefined();
      expect(item.revenue.freshness).toBeDefined();
      expect(item.drillDown.href).toContain(`divisionCode=${item.divisionCode}`);
      expect(item.drillDown.href).toContain('from=2024-01-01');
    }
  });

  it('Money Changer revenue gross null (valuta bukan revenue)', async () => {
    const mockPrisma = {
      division: { findMany: async () => [{ code: 'MC', name: 'Money Changer', updatedAt: new Date() }] },
    } as any;
    const service = new BodOverviewService(mockPrisma, {} as any);
    const overview = await service.getOverview();
    expect(overview[0]!.revenue.gross).toBeNull();
    expect(overview[0]!.revenue.source).toBe('forex.volume');
  });

  it('periode default dari awal bulan sampai hari ini', async () => {
    const mockPrisma = { division: { findMany: async () => [{ code: 'WRAP', name: 'Wrapping', updatedAt: new Date() }] } } as any;
    const service = new BodOverviewService(mockPrisma, {} as any);
    const overview = await service.getOverview();
    expect(overview[0]!.period.from).toMatch(/^\d{4}-\d{2}-01$/);
    expect(overview[0]!.period.to).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('workforce risk dan target achievement ada', async () => {
    const mockPrisma = { division: { findMany: async () => [{ code: 'WRAP', name: 'Wrapping', updatedAt: new Date() }] } } as any;
    const service = new BodOverviewService(mockPrisma, {} as any);
    const overview = await service.getOverview();
    expect(overview[0]!.workforce.risk).toBeDefined();
    expect(overview[0]!.target.achievement).toBeDefined();
    expect(overview[0]!.performance.score).toBeDefined();
  });
});
