import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DIVISION_KPIS, areDivisionsCompatible } from './kpi-compatibility';

export interface DivisionReadModel {
  divisionCode: string;
  divisionName: string;
  metrics: {
    kpiCode: string;
    value: number | null; // null jika belum ada data (MVP stub)
    compatible: boolean; // untuk lintas divisi comparison
  }[];
  compatibleDivisions: Record<string, string[]>; // per KPI, daftar divisi yang kompatibel
}

@Injectable()
export class BodReadModelService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async getExecutiveReadModel(): Promise<DivisionReadModel[]> {
    const divisions = await this.prisma.division.findMany({ orderBy: { sortOrder: 'asc' } });
    // fallback untuk test tanpa DB: pakai 7 divisi const
    const divs = divisions.length > 0
      ? divisions.map((d) => ({ code: d.code, name: d.name }))
      : [
          { code: 'WRAP', name: 'Wrapping' },
          { code: 'CELL', name: 'Cellular' },
          { code: 'REFL', name: 'Refleksi' },
          { code: 'MINI', name: 'Minimarket' },
          { code: 'FNB', name: 'FnB' },
          { code: 'FIN', name: 'Finance' },
          { code: 'MC', name: 'Money Changer' },
        ];

    return divs.map((div) => {
      const kpis = DIVISION_KPIS[div.code] ?? [];
      const metrics = kpis.map((kpi) => ({
        kpiCode: kpi.code,
        value: null, // stub — revenue/target belum diisi (akan diisi DASH-01/02)
        compatible: true, // untuk single divisi, selalu kompatibel dengan dirinya
      }));

      const compatibleDivisions: Record<string, string[]> = {};
      for (const kpi of kpis) {
        const compatible = divs
          .map((d) => d.code)
          .filter((otherCode) => otherCode !== div.code && areDivisionsCompatible(div.code, otherCode, kpi.code));
        compatibleDivisions[kpi.code] = compatible;
      }

      return {
        divisionCode: div.code,
        divisionName: div.name,
        metrics,
        compatibleDivisions,
      };
    });
  }

  // Untuk validasi sebelum bandingkan lintas divisi — Backlog §9
  isComparable(divisionA: string, divisionB: string, kpiCode: string): boolean {
    return areDivisionsCompatible(divisionA, divisionB, kpiCode);
  }
}
