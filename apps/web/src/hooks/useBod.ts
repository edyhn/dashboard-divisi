import { useQuery } from '@tanstack/react-query';
import { bodApi } from '../api/bod';
import { orgApi } from '../api/org';
import { useOrgFilters } from '../components/filters/OrgFilters';
import { useAuth } from '../session/AuthContext';

export function useBodOverview() {
  const { periodFrom, periodTo } = useOrgFilters();
  const { user, loading } = useAuth();
  return useQuery({
    queryKey: ['bod', 'overview', periodFrom, periodTo, user?.id],
    queryFn: () => bodApi.overview(periodFrom || undefined, periodTo || undefined).then((r) => r.data),
    enabled: !loading && !!user,
  });
}

export function useExecutiveReadModel() {
  const { user, loading } = useAuth();
  return useQuery({ queryKey: ['bod', 'executive', user?.id], queryFn: () => bodApi.executive().then((r) => r.data), enabled: !loading && !!user });
}

export function useDivisionConfigs() {
  const { user, loading } = useAuth();
  return useQuery({ queryKey: ['division-configs', user?.id], queryFn: () => bodApi.divisionConfigs().then((r) => r.data), enabled: !loading && !!user });
}

export function useOrgContext() {
  const { user, loading } = useAuth();
  return useQuery({ queryKey: ['org', 'context', user?.id], queryFn: () => orgApi.context().then((r) => r.data), enabled: !loading && !!user });
}

export function useDivisions() {
  const { user, loading } = useAuth();
  return useQuery({ queryKey: ['org', 'divisions', user?.id], queryFn: () => orgApi.divisions().then((r) => r.data), enabled: !loading && !!user });
}

export function useOutlets(divisionCode?: string) {
  const { user, loading } = useAuth();
  return useQuery({ queryKey: ['org', 'outlets', divisionCode, user?.id], queryFn: () => orgApi.outlets(divisionCode).then((r) => r.data), enabled: !loading && !!user });
}
