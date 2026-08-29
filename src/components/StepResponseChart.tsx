import type { StepResponsePoint } from "@/lib/calculations/controlSystems";

interface StepResponseChartProps {
  points: StepResponsePoint[];
  peakTimeS?: number | null;
  settlingTimeS?: number;
}

const VIEW_W = 640;
const VIEW_H = 340;
const PAD_L = 55;
const PAD_R = 20;
const PAD_T = 25;
const PAD_B = 40;

export default function StepResponseChart({
  points,
  peakTimeS,
  settlingTimeS,
}: StepResponseChartProps) {
  if (points.length === 0) return null;

  const tMax = points[points.length - 1].tS;
  const yMax = Math.max(1.15, ...points.map((p) => p.value)) * 1.05;
  const yMin = Math.min(0, ...points.map((p) => p.value));

  const plotW = VIEW_W - PAD_L - PAD_R;
  const plotH = VIEW_H - PAD_T - PAD_B;

  const toSvgX = (t: number) => PAD_L + (t / tMax) * plotW;
  const toSvgY = (v: number) => PAD_T + plotH - ((v - yMin) / (yMax - yMin)) * plotH;

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${toSvgX(p.tS).toFixed(2)} ${toSvgY(p.value).toFixed(2)}`)
    .join(" ");

  const yTicks = [0, 0.25, 0.5, 0.75, 1, Math.max(1, Math.round(yMax * 4) / 4)].filter(
    (v, i, arr) => arr.indexOf(v) === i,
  );
  const tTicks = Array.from({ length: 6 }, (_, i) => (tMax * i) / 5);

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      className="h-auto w-full rounded-lg border border-slate-200 bg-white"
    >
      {/* Steady-state reference line */}
      <line x1={PAD_L} y1={toSvgY(1)} x2={VIEW_W - PAD_R} y2={toSvgY(1)} stroke="#94a3b8" strokeWidth={1} strokeDasharray="4 4" />

      {/* Gridlines */}
      {yTicks.map((t, i) => (
        <line key={`gy-${i}`} x1={PAD_L} y1={toSvgY(t)} x2={VIEW_W - PAD_R} y2={toSvgY(t)} stroke="#f1f5f9" strokeWidth={1} />
      ))}

      {/* Axes */}
      <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={VIEW_H - PAD_B} stroke="#94a3b8" strokeWidth={1.5} />
      <line x1={PAD_L} y1={VIEW_H - PAD_B} x2={VIEW_W - PAD_R} y2={VIEW_H - PAD_B} stroke="#94a3b8" strokeWidth={1.5} />

      {/* Tick labels */}
      {yTicks.map((t, i) => (
        <text key={`yl-${i}`} x={PAD_L - 8} y={toSvgY(t) + 3} textAnchor="end" fontSize={10} fill="#64748b">
          {t.toFixed(2)}
        </text>
      ))}
      {tTicks.map((t, i) => (
        <text key={`tl-${i}`} x={toSvgX(t)} y={VIEW_H - PAD_B + 18} textAnchor="middle" fontSize={10} fill="#64748b">
          {t.toFixed(2)}s
        </text>
      ))}

      {/* Peak time marker */}
      {peakTimeS != null && peakTimeS <= tMax && (
        <line x1={toSvgX(peakTimeS)} y1={PAD_T} x2={toSvgX(peakTimeS)} y2={VIEW_H - PAD_B} stroke="#dc2626" strokeWidth={1} strokeDasharray="3 3" />
      )}

      {/* Settling time marker */}
      {settlingTimeS != null && settlingTimeS <= tMax && (
        <line x1={toSvgX(settlingTimeS)} y1={PAD_T} x2={toSvgX(settlingTimeS)} y2={VIEW_H - PAD_B} stroke="#16a34a" strokeWidth={1} strokeDasharray="3 3" />
      )}

      {/* Response curve */}
      <path d={linePath} fill="none" stroke="#2563eb" strokeWidth={2.5} />

      {/* Legend */}
      <g transform={`translate(${PAD_L + 8}, ${PAD_T + 8})`}>
        <line x1={0} y1={0} x2={16} y2={0} stroke="#94a3b8" strokeWidth={1} strokeDasharray="4 4" />
        <text x={20} y={3} fontSize={10} fill="#64748b">Steady-state (1.0)</text>
        {peakTimeS != null && (
          <>
            <line x1={0} y1={14} x2={16} y2={14} stroke="#dc2626" strokeWidth={1} strokeDasharray="3 3" />
            <text x={20} y={17} fontSize={10} fill="#dc2626">Peak time</text>
          </>
        )}
        {settlingTimeS != null && (
          <>
            <line x1={0} y1={28} x2={16} y2={28} stroke="#16a34a" strokeWidth={1} strokeDasharray="3 3" />
            <text x={20} y={31} fontSize={10} fill="#16a34a">Settling time (2%)</text>
          </>
        )}
      </g>
    </svg>
  );
}
