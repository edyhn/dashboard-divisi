import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { targetsApi } from '../api/targets';
import { useAuth } from '../session/AuthContext';

export function useTargetsCurrent(params?: Record<string, string | undefined>) {
  const { user, loading } = useAuth();
  return useQuery({ queryKey: ['targets', 'current', params, user?.id], queryFn: () => targetsApi.currentMonth(params).then((r) => r.data), enabled: !loading && !!user });
}
export function useTargetsRunRate(params?: Record<string, string | undefined>) {
  const { user, loading } = useAuth();
  return useQuery({ queryKey: ['targets', 'runRate', params, user?.id], queryFn: () => targetsApi.runRate(params).then((r) => r.data), enabled: !loading && !!user });
}
export function useUpsertTarget() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (payload: Record<string, unknown>) => targetsApi.upsert(payload).then((r) => r.data), onSuccess: () => void qc.invalidateQueries({ queryKey: ['targets'] }) });
}
