import { api } from './client';

export interface BodOverviewItem {
  divisionCode: string;
  divisionName: string;
  revenue: { gross: number | null; source: string; freshness: string };
  target: { value: number; achievement: number; source: string };
  performance: { score: number; level: string; source: string };
  workforce: { count: number; risk: string; source: string };
  period: { from: string; to: string };
  drillDown: { href: string };
}

export interface ExecutiveItem {
  divisionCode: string;
  divisionName: string;
  metrics: { kpiCode: string; value: unknown; compatible: boolean }[];
  compatibleDivisions: Record<string, string[]>;
}

export const bodApi = {
  overview: (from?: string, to?: string) => api.get<BodOverviewItem[]>('/bod/overview', { from, to }),
  executive: () => api.get<ExecutiveItem[]>('/bod/executive-read-model'),
  kpiCompatibility: (a: string, b: string, kpi: string) => api.get<{ divisionA: string; divisionB: string; kpiCode: string; compatible: boolean }>('/bod/kpi-compatibility', { a, b, kpi }),
  divisionConfigs: () => api.get<{ divisionCode: string; divisionName: string; enabledModules: string[]; enabledKpis: string[]; isActive: boolean }[]>('/division-configs'),
};
