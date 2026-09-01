import type { ReactNode } from 'react';

export function TableWrap({ children, minWidth = '720px' }: { children: ReactNode; minWidth?: string }) {
  return <div className="overflow-x-auto rounded-card border border-line" style={{ minWidth: undefined }}><table className={`w-full text-left text-sm`} style={{ minWidth }}>{children}</table></div>;
}

export function TableHead({ children }: { children: ReactNode }) {
  return <thead className="bg-surface text-slate-500">{children}</thead>;
}
