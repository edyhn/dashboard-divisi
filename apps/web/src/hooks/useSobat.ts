import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { sobathrApi, type SobatStatusDto, type SobatSyncResultDto } from '../api/sobathr';
import { useAuth } from '../session/AuthContext';

export function useSobatStatus() {
  const { user, loading } = useAuth();
  return useQuery<SobatStatusDto>({
    queryKey: ['sobathr', 'status', user?.id],
    queryFn: () => sobathrApi.getStatus().then((r) => r.data),
    enabled: !loading && !!user,
    staleTime: 60 * 1000,
  });
}

export function useSobatSyncTenants() {
  const qc = useQueryClient();
  return useMutation<SobatSyncResultDto, Error, string | undefined>({
    mutationFn: (divisionCode?: string) =>
      sobathrApi.syncTenants(divisionCode).then((r) => r.data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['sobathr'] });
      void qc.invalidateQueries({ queryKey: ['revenue'] });
    },
  });
}
