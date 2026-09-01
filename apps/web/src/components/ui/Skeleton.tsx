/**
 * SOP 1B: UI Components pure + Skeleton loading state
 */
export function Skeleton({ className = '' }: { className?: string }) {
  return <div aria-hidden="true" className={`animate-pulse rounded bg-slate-200 ${className}`} />;
}

export function SkeletonCard() {
  return (
    <div className="rounded-card border border-line bg-white p-5 shadow-card">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="mt-3 h-6 w-24" />
      <Skeleton className="mt-2 h-3 w-40" />
    </div>
  );
}
