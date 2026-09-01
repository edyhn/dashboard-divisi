/**
 * SOP 1B: Custom Hooks & State — semua fetch via hooks, tidak di page langsung.
 * Disiapkan untuk swapping ke Laravel Envelope saat BE ready (SOP 4).
 */
import { useQuery } from '@tanstack/react-query';

// SOP 4: Envelope format
export interface ApiEnvelope<T> {
  data: T;
  meta: { trace_id: string; total?: number };
  links?: { self?: string };
}

export interface ApiErrorEnvelope {
  message: string;
  error_code?: string;
  meta: { trace_id: string };
}

// Mock fetcher — SOP: page tidak boleh raw fetch
export function useMockQuery<T>(key: string[], data: T, delayMs = 0) {
  return useQuery({
    queryKey: key,
    queryFn: async (): Promise<ApiEnvelope<T>> => {
      if (delayMs) await new Promise((r) => setTimeout(r, delayMs));
      return {
        data,
        meta: { trace_id: `mock-${key.join('-')}` },
      };
    },
  });
}
