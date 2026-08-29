export function NumberField({
  label,
  unit,
  value,
  onChange,
  step = 1,
  min,
}: {
  label: string;
  unit?: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-slate-700">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="number"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-500 focus:outline-none"
          value={value}
          step={step}
          min={min}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        {unit && <span className="w-16 shrink-0 text-slate-500">{unit}</span>}
      </div>
    </label>
  );
}
