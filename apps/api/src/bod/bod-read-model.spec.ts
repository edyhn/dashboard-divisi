/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from 'vitest';
import { areDivisionsCompatible, DIVISION_KPIS, isKpiCompatible } from './kpi-compatibility';
import { BodReadModelService } from './bod-read-model.service';

describe('BOD-01 KPI compatibility — lintas 7 divisi', () => {
  it('revenue.gross kompatibel untuk WRAP/CELL/MINI/FNB/FIN (same formula)', () => {
    expect(areDivisionsCompatible('WRAP', 'CELL', 'revenue.gross')).toBe(true);
    expect(areDivisionsCompatible('WRAP', 'MINI', 'revenue.gross')).toBe(true);
    expect(areDivisionsCompatible('MINI', 'FIN', 'revenue.gross')).toBe(true);
  });

  it('Money Changer tidak punya revenue.gross — tidak kompatibel', () => {
    expect(areDivisionsCompatible('WRAP', 'MC', 'revenue.gross')).toBe(false);
    expect(areDivisionsCompatible('MC', 'FIN', 'revenue.gross')).toBe(false);
    expect(DIVISION_KPIS['MC']?.some((k) => k.code === 'revenue.gross')).toBe(false);
    expect(DIVISION_KPIS['MC']?.some((k) => k.code === 'forex.volume')).toBe(true);
  });

  it('forex.volume hanya untuk MC — WRAP tidak kompatibel', () => {
    expect(areDivisionsCompatible('MC', 'WRAP', 'forex.volume')).toBe(false);
  });

  it('isKpiCompatible cek level/unit/formula/version', () => {
    const kpiA = { code: 'revenue.gross', level: 'division' as const, unit: 'idr' as const, formula: 'sum(revenue.daily)', version: 'v1' };
    const kpiB = { ...kpiA };
    expect(isKpiCompatible(kpiA, kpiB)).toBe(true);
    expect(isKpiCompatible(kpiA, { ...kpiB, version: 'v2' })).toBe(false);
    expect(isKpiCompatible(kpiA, { ...kpiB, unit: 'percent' as const })).toBe(false);
  });

  it('BodReadModelService menghasilkan 7 divisi dengan compatibleDivisions', async () => {
    // mock PrismaService dengan 0 divisions -> fallback ke 7 const
    const mockPrisma = { division: { findMany: async () => [] } } as any;
    const service = new BodReadModelService(mockPrisma);
    const model = await service.getExecutiveReadModel();
    expect(model.length).toBe(7);
    expect(model.map((d) => d.divisionCode)).toEqual(['WRAP', 'CELL', 'REFL', 'MINI', 'FNB', 'FIN', 'MC']);

    const wrap = model.find((d) => d.divisionCode === 'WRAP')!;
    expect(wrap.metrics.some((m) => m.kpiCode === 'revenue.gross')).toBe(true);
    // WRAP revenue.gross kompatibel dengan CELL
    expect(wrap.compatibleDivisions['revenue.gross']).toContain('CELL');
    // WRAP tidak kompatibel dengan MC untuk revenue.gross
    expect(wrap.compatibleDivisions['revenue.gross']).not.toContain('MC');

    const mc = model.find((d) => d.divisionCode === 'MC')!;
    expect(mc.metrics.some((m) => m.kpiCode === 'forex.volume')).toBe(true);
    expect(mc.compatibleDivisions['forex.volume']).toEqual([]); // hanya MC yang punya
  });

  it('isComparable wrapper', async () => {
    const mockPrisma = { division: { findMany: async () => [] } } as any;
    const service = new BodReadModelService(mockPrisma);
    expect(service.isComparable('WRAP', 'CELL', 'revenue.gross')).toBe(true);
    expect(service.isComparable('WRAP', 'MC', 'revenue.gross')).toBe(false);
  });
});
