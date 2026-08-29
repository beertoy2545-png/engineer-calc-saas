interface ScatterPlotProps {
  xs: number[];
  ys: number[];
  predict?: (x: number) => number;
}

const VIEW_W = 640;
const VIEW_H = 380;
const PAD_L = 60;
const PAD_R = 20;
const PAD_T = 20;
const PAD_B = 45;

function niceTicks(min: number, max: number, count = 5): number[] {
  if (min === max) return [min];
  const range = max - min;
  const step = range / (count - 1);
  return Array.from({ length: count }, (_, i) => min + step * i);
}

export default function ScatterPlot({ xs, ys, predict }: ScatterPlotProps) {
  if (xs.length === 0 || xs.length !== ys.length) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-400">
        ไม่มีข้อมูลให้แสดงผล (ตรวจสอบว่าจำนวนจุด X และ Y เท่ากัน)
      </div>
    );
  }

  const xMinData = Math.min(...xs);
  const xMaxData = Math.max(...xs);
  const yMinData = Math.min(...ys);
  const yMaxData = Math.max(...ys);

  const xPad = (xMaxData - xMinData) * 0.1 || 1;
  const yPad = (yMaxData - yMinData) * 0.1 || 1;
  const xMin = xMinData - xPad;
  const xMax = xMaxData + xPad;
  const yMin = yMinData - yPad;
  const yMax = yMaxData + yPad;

  const plotW = VIEW_W - PAD_L - PAD_R;
  const plotH = VIEW_H - PAD_T - PAD_B;

  const toSvgX = (x: number) => PAD_L + ((x - xMin) / (xMax - xMin)) * plotW;
  const toSvgY = (y: number) => PAD_T + plotH - ((y - yMin) / (yMax - yMin)) * plotH;

  const xTicks = niceTicks(xMin, xMax);
  const yTicks = niceTicks(yMin, yMax);

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      className="h-auto w-full rounded-lg border border-slate-200 bg-white"
    >
      {/* Gridlines */}
      {yTicks.map((t, i) => (
        <line
          key={`gy-${i}`}
          x1={PAD_L}
          y1={toSvgY(t)}
          x2={VIEW_W - PAD_R}
          y2={toSvgY(t)}
          stroke="#f1f5f9"
          strokeWidth={1}
        />
      ))}
      {xTicks.map((t, i) => (
        <line
          key={`gx-${i}`}
          x1={toSvgX(t)}
          y1={PAD_T}
          x2={toSvgX(t)}
          y2={VIEW_H - PAD_B}
          stroke="#f1f5f9"
          strokeWidth={1}
        />
      ))}

      {/* Axes */}
      <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={VIEW_H - PAD_B} stroke="#94a3b8" strokeWidth={1.5} />
      <line
        x1={PAD_L}
        y1={VIEW_H - PAD_B}
        x2={VIEW_W - PAD_R}
        y2={VIEW_H - PAD_B}
        stroke="#94a3b8"
        strokeWidth={1.5}
      />

      {/* Axis tick labels */}
      {xTicks.map((t, i) => (
        <text key={`xl-${i}`} x={toSvgX(t)} y={VIEW_H - PAD_B + 18} textAnchor="middle" fontSize={10} fill="#64748b">
          {t.toFixed(1)}
        </text>
      ))}
      {yTicks.map((t, i) => (
        <text key={`yl-${i}`} x={PAD_L - 8} y={toSvgY(t) + 3} textAnchor="end" fontSize={10} fill="#64748b">
          {t.toFixed(1)}
        </text>
      ))}

      {/* Regression line */}
      {predict && (
        <line
          x1={toSvgX(xMin)}
          y1={toSvgY(predict(xMin))}
          x2={toSvgX(xMax)}
          y2={toSvgY(predict(xMax))}
          stroke="#dc2626"
          strokeWidth={2}
        />
      )}

      {/* Data points */}
      {xs.map((x, i) => (
        <circle key={i} cx={toSvgX(x)} cy={toSvgY(ys[i])} r={5} fill="#2563eb" fillOpacity={0.75} stroke="#1e3a8a" strokeWidth={1} />
      ))}
    </svg>
  );
}
