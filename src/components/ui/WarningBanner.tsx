export function WarningBanner({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      {children}
    </div>
  );
}
