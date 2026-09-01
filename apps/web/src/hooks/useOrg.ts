/**
 * SOP 1B: hooks org real BE — mengganti getMockOutlets.
 * Source: GET /org/divisions + GET /org/outlets?divisionCode=WRAP (Laravel OrgReadModelService, scope server-side).
 * Fallback ke DIVISIONS statis bila BE belum terjangkau / test (setupTests mock).
 */
import { useQuery } from '@tanstack/react-query';

import { api } from '../api/client';
import { DIVISIONS } from '../config/divisions';
import type { DivisionCode } from '../config/divisions';

interface Division {
  code: string;
  name: string;
  isActive: boolean;
  sortOrder: number;
}

interface Outlet {
  code: string;
  name: string;
  divisionId: string;
  isActive: boolean;
}

export function useOrgDivisions() {
  return useQuery({
    queryKey: ['org', 'divisions'],
    queryFn: async () => {
      const res = await api.get<Division[]>('/org/divisions');
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
    // Fallback placeholder agar UI tetap render walau offline/test
    placeholderData: DIVISIONS.map((d, i) => ({ code: d.code, name: d.name, isActive: true, sortOrder: i })) as Division[],
  });
}

export function useOrgOutlets(divisionCode?: string) {
  return useQuery({
    queryKey: ['org', 'outlets', divisionCode ?? 'all'],
    queryFn: async () => {
      const res = await api.get<Outlet[]>('/org/outlets', divisionCode ? { divisionCode } : undefined);
      return res.data;
    },
    enabled: !!divisionCode,
    staleTime: 2 * 60 * 1000,
    placeholderData: divisionCode ? ([{ code: `${divisionCode}-001` as string, name: `${divisionCode} 001`, divisionId: divisionCode, isActive: true }, { code: `${divisionCode}-002` as string, name: `${divisionCode} 002`, divisionId: divisionCode, isActive: true }] as Outlet[]) : undefined,
  });
}

export function isDivisionCodeReal(value: string): value is DivisionCode {
  return DIVISIONS.some((d) => d.code === value);
}
