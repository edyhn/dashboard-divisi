import '@testing-library/jest-dom';

// Mock fetch untuk test tanpa BE real — kembalikan envelope mock
const mockBodOverview = [
  { divisionCode: 'WRAP', divisionName: 'Wrapping', revenue: { gross: 344, source: 'revenue.daily', freshness: new Date().toISOString() }, target: { value: 370, achievement: 93, source: 'target.monthly' }, performance: { score: 88, level: 'C', source: 'performance.score' }, workforce: { count: 20, risk: 'low', source: 'workforce.count' }, period: { from: '2026-09-01', to: '2026-09-30' }, drillDown: { href: '/dashboard?divisionCode=WRAP' } },
  { divisionCode: 'CELL', divisionName: 'Cellular', revenue: { gross: 431, source: 'revenue.daily', freshness: new Date().toISOString() }, target: { value: 415, achievement: 104, source: 'target.monthly' }, performance: { score: 90, level: 'B', source: 'performance.score' }, workforce: { count: 20, risk: 'low', source: 'workforce.count' }, period: { from: '2026-09-01', to: '2026-09-30' }, drillDown: { href: '/dashboard?divisionCode=CELL' } },
  { divisionCode: 'MINI', divisionName: 'Minimarket', revenue: { gross: 482, source: 'revenue.daily', freshness: new Date().toISOString() }, target: { value: 550, achievement: 87, source: 'target.monthly' }, performance: { score: 91, level: 'A', source: 'performance.score' }, workforce: { count: 30, risk: 'low', source: 'workforce.count' }, period: { from: '2026-09-01', to: '2026-09-30' }, drillDown: { href: '/dashboard?divisionCode=MINI' } },
  { divisionCode: 'FNB', divisionName: 'FnB', revenue: { gross: 386, source: 'revenue.daily', freshness: new Date().toISOString() }, target: { value: 395, achievement: 98, source: 'target.monthly' }, performance: { score: 89, level: 'B', source: 'performance.score' }, workforce: { count: 20, risk: 'low', source: 'workforce.count' }, period: { from: '2026-09-01', to: '2026-09-30' }, drillDown: { href: '/dashboard?divisionCode=FNB' } },
  { divisionCode: 'REFL', divisionName: 'Refleksi', revenue: { gross: 300, source: 'revenue.daily', freshness: new Date().toISOString() }, target: { value: 300, achievement: 100, source: 'target.monthly' }, performance: { score: 85, level: 'B', source: 'performance.score' }, workforce: { count: 15, risk: 'low', source: 'workforce.count' }, period: { from: '2026-09-01', to: '2026-09-30' }, drillDown: { href: '/dashboard?divisionCode=REFL' } },
  { divisionCode: 'FIN', divisionName: 'Finance', revenue: { gross: 200, source: 'revenue.daily', freshness: new Date().toISOString() }, target: { value: 200, achievement: 100, source: 'target.monthly' }, performance: { score: 88, level: 'B', source: 'performance.score' }, workforce: { count: 10, risk: 'low', source: 'workforce.count' }, period: { from: '2026-09-01', to: '2026-09-30' }, drillDown: { href: '/dashboard?divisionCode=FIN' } },
  { divisionCode: 'MC', divisionName: 'Money Changer', revenue: { gross: null, source: 'forex.volume', freshness: new Date().toISOString() }, target: { value: 0, achievement: 0, source: 'target.monthly' }, performance: { score: 0, level: 'C', source: 'performance.score' }, workforce: { count: 5, risk: 'low', source: 'workforce.count' }, period: { from: '2026-09-01', to: '2026-09-30' }, drillDown: { href: '/dashboard?divisionCode=MC' } },
];
const originalFetch = globalThis.fetch;
globalThis.fetch = async (input: RequestInfo | URL, _init?: RequestInit) => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : (input as Request).url;
  // Auth me — fallback ke 401 jika tidak ada role di localStorage, biar AuthContext fallback ke mock
  if (url.includes('/auth/me')) {
    const role = (globalThis as unknown as { localStorage: Storage }).localStorage?.getItem('dashboard-divisi.role-demo');
    if (role) {
      return new Response(JSON.stringify({ data: { id: 'test', email: `${role.toLowerCase()}@dashboard.test`, name: `${role} Test`, role, divisionCode: role === 'BOD' ? null : 'WRAP' }, meta: { trace_id: 'test-trace' } }), { status: 200, headers: { 'Content-Type': 'application/json', 'X-Trace-Id': 'test-trace' } });
    }
    return new Response(JSON.stringify({ error: { code: 'AUTH_REQUIRED', message: 'Unauthorized', trace_id: 'test-trace' } }), { status: 401, headers: { 'Content-Type': 'application/json', 'X-Trace-Id': 'test-trace' } });
  }
  if (url.includes('/bod/overview')) {
    return new Response(JSON.stringify({ data: mockBodOverview, meta: { trace_id: 'test-trace' } }), { status: 200, headers: { 'Content-Type': 'application/json', 'X-Trace-Id': 'test-trace' } });
  }
  if (url.includes('/bod/executive-read-model')) {
    return new Response(JSON.stringify({ data: [{ divisionCode: 'WRAP', divisionName: 'Wrapping', metrics: [{ kpiCode: 'revenue.gross' }], compatibleDivisions: { 'revenue.gross': ['CELL'] } }], meta: { trace_id: 'test-trace' } }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }
  if (url.includes('/org/me/context')) {
    return new Response(JSON.stringify({ data: { user: { id: 'u1', email: 'hrd@test', role: 'HRD', divisionCode: null }, divisions: [{ code: 'WRAP', name: 'Wrapping' }], outlets: [{ code: 'WRAP-001', name: 'Wrapping Pusat' }], assignments: [], scope: 'ALL_7_DIVISI' }, meta: { trace_id: 'test-trace' } }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }
  if (url.includes('/org/divisions')) {
    return new Response(JSON.stringify({ data: [{ id: '1', code: 'WRAP', name: 'Wrapping', isActive: true, sortOrder: 1 }], meta: { trace_id: 'test-trace' } }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }
  if (url.includes('/org/outlets')) {
    return new Response(JSON.stringify({ data: [{ id: '1', code: 'WRAP-001', name: 'Wrapping Pusat', divisionId: '1', isActive: true }], meta: { trace_id: 'test-trace' } }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }
  if (url.includes('/org/assignments')) {
    return new Response(JSON.stringify({ data: [{ id: 'test-1', division_id: '1', outlet_id: '1', employee_id: 'emp-1', effective_from: '2026-09-01', effective_to: null }], meta: { trace_id: 'test-trace' } }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }
  if (url.includes('/division-configs')) {
    return new Response(JSON.stringify({ data: [{ divisionCode: 'WRAP', divisionName: 'Wrapping', enabledModules: ['dashboard'], enabledKpis: ['revenue.gross'], isActive: true }, { divisionCode: 'MC', divisionName: 'Money Changer', enabledModules: ['forex'], enabledKpis: ['forex.volume'], isActive: true }], meta: { trace_id: 'test-trace' } }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }
  if (url.includes('/targets/current-month')) {
    return new Response(JSON.stringify({ data: [{ id: 't1', outlet_id: 'out-1', amount: 100, status: 'draft', period_month: '2026-09' }], meta: { trace_id: 'test-trace' } }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }
  if (url.includes('/revenue/daily') || url.includes('/reports/') || url.includes('/org/')) {
    return new Response(JSON.stringify({ data: [], meta: { trace_id: 'test-trace' } }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }
  // fallback ke fetch asli jika ada
  if (originalFetch) return originalFetch(input as RequestInfo, _init);
  return new Response(JSON.stringify({ data: null, meta: { trace_id: 'test-trace' } }), { status: 200, headers: { 'Content-Type': 'application/json' } });
};

// Polyfill localStorage in jsdom / Node 25 environment
const storageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] ?? null,
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: storageMock,
  writable: true,
});
Object.defineProperty(globalThis, 'localStorage', {
  value: storageMock,
  writable: true,
});
