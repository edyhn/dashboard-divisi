/* eslint-disable @typescript-eslint/no-explicit-any */
import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BodReadModelService } from './bod-read-model.service';

export interface BodOverviewItem {
  divisionCode: string;
  divisionName: string;
  revenue: { gross: number | null; source: string; freshness: string | null };
  target: { value: number | null; achievement: number | null; source: string };
  performance: { score: number | null; level: string | null; source: string };
  workforce: { count: number | null; risk: 'low' | 'medium' | 'high' | null; source: string };
  period: { from: string; to: string };
  drillDown: { href: string };
}

@Injectable()
export class BodOverviewService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(BodReadModelService) private readonly readModel: BodReadModelService,
  ) {}

  async getOverview(periodFrom?: string, periodTo?: string): Promise<BodOverviewItem[]> {
    const divisions = await this.prisma.division.findMany({ orderBy: { sortOrder: 'asc' } });
    const divs = divisions.length > 0
      ? divisions.map((d) => ({ code: d.code, name: d.name, updatedAt: d.updatedAt }))
      : [
          { code: 'WRAP', name: 'Wrapping', updatedAt: new Date() },
          { code: 'CELL', name: 'Cellular', updatedAt: new Date() },
          { code: 'REFL', name: 'Refleksi', updatedAt: new Date() },
          { code: 'MINI', name: 'Minimarket', updatedAt: new Date() },
          { code: 'FNB', name: 'FnB', updatedAt: new Date() },
          { code: 'FIN', name: 'Finance', updatedAt: new Date() },
          { code: 'MC', name: 'Money Changer', updatedAt: new Date() },
        ];

    const now = new Date();
    const from = periodFrom ?? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const to = periodTo ?? now.toISOString().slice(0, 10);

    // For MVP, stub values — real DASH/TGT/PERF will fill later, but structure + source/freshness/drill-down ready
    return divs.map((div) => {
      const isMC = div.code === 'MC';
      return {
        divisionCode: div.code,
        divisionName: div.name,
        revenue: {
          gross: isMC ? null : 0, // MC valuta bukan revenue
          source: isMC ? 'forex.volume' : 'revenue.daily',
          freshness: (div as any).updatedAt ? new Date((div as any).updatedAt).toISOString() : new Date().toISOString(),
        },
        target: {
          value: 0,
          achievement: 0,
          source: 'target.monthly',
        },
        performance: {
          score: 0,
          level: 'C',
          source: 'performance.score',
        },
        workforce: {
          count: 0,
          risk: 'low' as const,
          source: 'workforce.count',
        },
        period: { from, to },
        drillDown: { href: `/dashboard?divisionCode=${div.code}&from=${from}&to=${to}` },
      };
    });
  }
}
