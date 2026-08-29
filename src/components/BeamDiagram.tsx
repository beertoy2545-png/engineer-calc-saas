import {
  calculateDeflectionCurve,
  type BeamAnalysisInput,
} from "@/lib/calculations/beamAnalysis";

const VIEW_W = 640;
const VIEW_H = 260;
const PAD_X = 50;
const BEAM_Y = 110;
const CURVE_SCALE_PX = 60; // max visual dip, in px, at the largest sampled deflection

export default function BeamDiagram({ input }: { input: BeamAnalysisInput }) {
  const points = calculateDeflectionCurve(input, 61);
  const lMm = input.spanM * 1000;
  const maxAbsY = Math.max(1e-9, ...points.map((p) => Math.abs(p.yMm)));

  const toSvgX = (xMm: number) => PAD_X + (xMm / lMm) * (VIEW_W - 2 * PAD_X);
  const toSvgY = (yMm: number) => BEAM_Y + (yMm / maxAbsY) * CURVE_SCALE_PX;

  const curvePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${toSvgX(p.xMm).toFixed(1)} ${toSvgY(p.yMm).toFixed(1)}`)
    .join(" ");

  const beamX1 = toSvgX(0);
  const beamX2 = toSvgX(lMm);
  const isCantilever = input.supportType === "cantilever";

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      className="h-auto w-full rounded-lg border border-slate-200 bg-white"
    >
      {/* Undeformed beam (reference, dashed) */}
      <line
        x1={beamX1}
        y1={BEAM_Y}
        x2={beamX2}
        y2={BEAM_Y}
        stroke="#cbd5e1"
        strokeWidth={2}
        strokeDasharray="4 4"
      />

      {/* Deflected shape (exaggerated for visibility) */}
      <path d={curvePath} fill="none" stroke="#2563eb" strokeWidth={2.5} />

      {/* Supports */}
      {isCantilever ? (
        <g>
          {/* Fixed wall at x=0 */}
          <line x1={beamX1} y1={BEAM_Y - 30} x2={beamX1} y2={BEAM_Y + 30} stroke="#475569" strokeWidth={3} />
          {[...Array(6)].map((_, i) => (
            <line
              key={i}
              x1={beamX1}
              y1={BEAM_Y - 27 + i * 11}
              x2={beamX1 - 10}
              y2={BEAM_Y - 17 + i * 11}
              stroke="#475569"
              strokeWidth={1.5}
            />
          ))}
        </g>
      ) : (
        <g>
          {/* Pin at left, roller at right */}
          <polygon
            points={`${beamX1},${BEAM_Y + 4} ${beamX1 - 10},${BEAM_Y + 20} ${beamX1 + 10},${BEAM_Y + 20}`}
            fill="#475569"
          />
          <line x1={beamX1 - 14} y1={BEAM_Y + 20} x2={beamX1 + 14} y2={BEAM_Y + 20} stroke="#475569" strokeWidth={2} />
          <polygon
            points={`${beamX2},${BEAM_Y + 4} ${beamX2 - 10},${BEAM_Y + 20} ${beamX2 + 10},${BEAM_Y + 20}`}
            fill="#475569"
          />
          <circle cx={beamX2 - 6} cy={BEAM_Y + 24} r={3} fill="#475569" />
          <circle cx={beamX2 + 6} cy={BEAM_Y + 24} r={3} fill="#475569" />
        </g>
      )}

      {/* Load */}
      {input.loadType === "point" ? (
        (() => {
          const loadX = isCantilever ? beamX2 : (beamX1 + beamX2) / 2;
          return (
            <g>
              <line x1={loadX} y1={BEAM_Y - 55} x2={loadX} y2={BEAM_Y - 6} stroke="#dc2626" strokeWidth={2.5} />
              <polygon
                points={`${loadX},${BEAM_Y - 4} ${loadX - 5},${BEAM_Y - 14} ${loadX + 5},${BEAM_Y - 14}`}
                fill="#dc2626"
              />
              <text x={loadX} y={BEAM_Y - 60} textAnchor="middle" fontSize={12} fill="#dc2626" fontWeight={600}>
                P = {input.pointLoadKn} kN
              </text>
            </g>
          );
        })()
      ) : (
        <g>
          {[...Array(9)].map((_, i) => {
            const x = beamX1 + ((beamX2 - beamX1) * i) / 8;
            return (
              <g key={i}>
                <line x1={x} y1={BEAM_Y - 35} x2={x} y2={BEAM_Y - 6} stroke="#dc2626" strokeWidth={1.5} />
                <polygon
                  points={`${x},${BEAM_Y - 4} ${x - 3},${BEAM_Y - 10} ${x + 3},${BEAM_Y - 10}`}
                  fill="#dc2626"
                />
              </g>
            );
          })}
          <text
            x={(beamX1 + beamX2) / 2}
            y={BEAM_Y - 40}
            textAnchor="middle"
            fontSize={12}
            fill="#dc2626"
            fontWeight={600}
          >
            w = {input.udlKnPerM} kN/m
          </text>
        </g>
      )}

      {/* Span label */}
      <text x={(beamX1 + beamX2) / 2} y={BEAM_Y + 55} textAnchor="middle" fontSize={12} fill="#64748b">
        L = {input.spanM} m
      </text>
      <text x={(beamX1 + beamX2) / 2} y={toSvgY(points[Math.floor(points.length / 2)].yMm) + (input.supportType === "cantilever" ? -10 : 24)} textAnchor="middle" fontSize={11} fill="#2563eb">
        δmax (แสดงเกินจริงเพื่อให้เห็นชัด)
      </text>
    </svg>
  );
}
