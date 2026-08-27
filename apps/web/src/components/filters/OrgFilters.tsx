import { useSearchParams } from 'react-router-dom';

const DIVISIONS = [
  { code: 'WRAP', name: 'Wrapping' },
  { code: 'CELL', name: 'Cellular' },
  { code: 'REFL', name: 'Refleksi' },
  { code: 'MINI', name: 'Minimarket' },
  { code: 'FNB', name: 'FnB' },
  { code: 'FIN', name: 'Finance' },
  { code: 'MC', name: 'Money Changer' },
] as const;

export function useOrgFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const periodFrom = searchParams.get('from') ?? '';
  const periodTo = searchParams.get('to') ?? '';
  const divisionCode = searchParams.get('divisionCode') ?? '';
  const outletCode = searchParams.get('outletCode') ?? '';

  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  const clearAll = () => setSearchParams(new URLSearchParams());

  return {
    periodFrom,
    periodTo,
    divisionCode,
    outletCode,
    setFilter,
    clearAll,
    searchParams,
  };
}

export function OrgFilters() {
  const { periodFrom, periodTo, divisionCode, outletCode, setFilter, clearAll } = useOrgFilters();

  return (
    <div className="flex flex-wrap gap-3 p-3 border rounded bg-white">
      <label className="flex flex-col text-sm">
        Periode Dari
        <input
          type="date"
          value={periodFrom}
          onChange={(e) => setFilter('from', e.target.value)}
          className="border rounded px-2 py-1"
          data-testid="filter-from"
        />
      </label>
      <label className="flex flex-col text-sm">
        Periode Sampai
        <input
          type="date"
          value={periodTo}
          onChange={(e) => setFilter('to', e.target.value)}
          className="border rounded px-2 py-1"
          data-testid="filter-to"
        />
      </label>
      <label className="flex flex-col text-sm">
        Divisi
        <select
          value={divisionCode}
          onChange={(e) => {
            setFilter('divisionCode', e.target.value);
            setFilter('outletCode', ''); // reset outlet when divisi change
          }}
          className="border rounded px-2 py-1"
          data-testid="filter-division"
        >
          <option value="">Semua (BOD)</option>
          {DIVISIONS.map((d) => (
            <option key={d.code} value={d.code}>
              {d.name}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col text-sm">
        Outlet
        <select
          value={outletCode}
          onChange={(e) => setFilter('outletCode', e.target.value)}
          className="border rounded px-2 py-1"
          data-testid="filter-outlet"
          disabled={!divisionCode}
        >
          <option value="">Semua</option>
          {divisionCode && <option value={`${divisionCode}-001`}>{divisionCode}-001</option>}
        </select>
      </label>
      <button onClick={clearAll} className="self-end border rounded px-3 py-1 text-sm" data-testid="filter-clear">
        Clear
      </button>
    </div>
  );
}
