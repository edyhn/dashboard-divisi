// KPI compatibility rule — Backlog §9 ekspansi
// Metric hanya bisa dibandingkan lintas divisi jika level/unit/formula/version kompatibel

export type KpiLevel = 'outlet' | 'division' | 'company';
export type KpiUnit = 'idr' | 'percent' | 'score' | 'count';

export interface KpiDefinition {
  code: string; // e.g., revenue.gross, target.achievement
  level: KpiLevel;
  unit: KpiUnit;
  formula: string; // e.g., sum(revenue.daily), avg(score)
  version: string; // e.g., v1, v2
}

// KPI per divisi — 7 divisi MVP memiliki KPI berbeda, Money Changer valuta ≠ revenue
export const DIVISION_KPIS: Record<string, KpiDefinition[]> = {
  WRAP: [
    { code: 'revenue.gross', level: 'division', unit: 'idr', formula: 'sum(revenue.daily)', version: 'v1' },
    { code: 'target.achievement', level: 'division', unit: 'percent', formula: 'revenue/target*100', version: 'v1' },
  ],
  CELL: [
    { code: 'revenue.gross', level: 'division', unit: 'idr', formula: 'sum(revenue.daily)', version: 'v1' },
    { code: 'target.achievement', level: 'division', unit: 'percent', formula: 'revenue/target*100', version: 'v1' },
  ],
  REFL: [
    { code: 'revenue.gross', level: 'division', unit: 'idr', formula: 'sum(revenue.daily)', version: 'v1' },
    { code: 'performance.score', level: 'division', unit: 'score', formula: 'weighted(score)', version: 'v1' },
  ],
  MINI: [
    { code: 'revenue.gross', level: 'division', unit: 'idr', formula: 'sum(revenue.daily)', version: 'v1' },
    { code: 'revenue.net', level: 'division', unit: 'idr', formula: 'gross - discount', version: 'v1' },
    { code: 'target.achievement', level: 'division', unit: 'percent', formula: 'revenue/target*100', version: 'v1' },
  ],
  FNB: [
    { code: 'revenue.gross', level: 'division', unit: 'idr', formula: 'sum(revenue.daily)', version: 'v1' },
    { code: 'target.achievement', level: 'division', unit: 'percent', formula: 'revenue/target*100', version: 'v1' },
  ],
  FIN: [
    { code: 'revenue.gross', level: 'division', unit: 'idr', formula: 'sum(revenue.daily)', version: 'v1' },
    { code: 'workforce.count', level: 'division', unit: 'count', formula: 'count(employee)', version: 'v1' },
  ],
  MC: [
    // Money Changer: valuta bukan otomatis revenue — KPI berbeda
    { code: 'forex.volume', level: 'division', unit: 'idr', formula: 'sum(forex.volume)', version: 'v1' },
    { code: 'forex.spread', level: 'division', unit: 'percent', formula: 'avg(spread)', version: 'v1' },
  ],
};

export function isKpiCompatible(a: KpiDefinition, b: KpiDefinition): boolean {
  return a.level === b.level && a.unit === b.unit && a.formula === b.formula && a.version === b.version;
}

export function areDivisionsCompatible(divisionA: string, divisionB: string, kpiCode: string): boolean {
  const kpisA = DIVISION_KPIS[divisionA] ?? [];
  const kpisB = DIVISION_KPIS[divisionB] ?? [];
  const kpiA = kpisA.find((k) => k.code === kpiCode);
  const kpiB = kpisB.find((k) => k.code === kpiCode);
  if (!kpiA || !kpiB) return false; // salah satu tidak punya KPI tersebut
  return isKpiCompatible(kpiA, kpiB);
}

export function getCompatibleDivisions(kpiCode: string): string[] {
  const allDivs = Object.keys(DIVISION_KPIS);
  // kelompokkan divisi yang sharing KPI yang kompatibel
  const groups: string[][] = [];
  const visited = new Set<string>();
  for (const div of allDivs) {
    if (visited.has(div)) continue;
    const group = [div];
    visited.add(div);
    for (const other of allDivs) {
      if (visited.has(other)) continue;
      if (areDivisionsCompatible(div, other, kpiCode)) {
        group.push(other);
        visited.add(other);
      }
    }
    if (group.length > 1) groups.push(group);
  }
  // kembalikan grup yang mengandung KPI tersebut dan kompatibel
  for (const group of groups) {
    if (group.some((d) => (DIVISION_KPIS[d] ?? []).some((k) => k.code === kpiCode))) {
      return group;
    }
  }
  // jika tidak ada grup, kembalikan yang punya KPI saja
  return allDivs.filter((d) => (DIVISION_KPIS[d] ?? []).some((k) => k.code === kpiCode));
}
