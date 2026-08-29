import type {
  TrussMember,
  TrussMemberResult,
  TrussNode,
  TrussNodeResult,
} from "@/lib/calculations/trussAnalysis";

export type CanvasMode = "select" | "addNode" | "addMember" | "delete";

interface TrussDiagramProps {
  nodes: TrussNode[];
  members: TrussMember[];
  nodeResults: TrussNodeResult[];
  memberResults: TrussMemberResult[];
  mode: CanvasMode;
  selectedNodeId: number | null;
  pendingMemberFromId: number | null;
  onCanvasClick?: (xM: number, yM: number) => void;
  onNodeClick?: (nodeId: number) => void;
  onMemberClick?: (memberId: number) => void;
}

const VIEW_W = 640;
const VIEW_H = 420;
const PAD = 60;
// Fallback data-space size (m) used to keep a sensible scale when there are
// 0-1 nodes (so an empty canvas isn't zoomed to infinity).
const DEFAULT_SPAN_M = 10;

function computeTransform(nodes: TrussNode[]) {
  const xs = nodes.length ? nodes.map((n) => n.xM) : [0];
  const ys = nodes.length ? nodes.map((n) => n.yM) : [0];
  const minX = Math.min(...xs) - (nodes.length ? 0 : DEFAULT_SPAN_M / 2);
  const maxX = Math.max(...xs) + (nodes.length ? 0 : DEFAULT_SPAN_M / 2);
  const minY = Math.min(...ys) - (nodes.length ? 0 : DEFAULT_SPAN_M / 2);
  const maxY = Math.max(...ys) + (nodes.length ? 0 : DEFAULT_SPAN_M / 2);
  const dataW = Math.max(maxX - minX, 1);
  const dataH = Math.max(maxY - minY, 1);

  const scale = Math.min((VIEW_W - 2 * PAD) / dataW, (VIEW_H - 2 * PAD) / dataH);
  const offsetX = PAD + ((VIEW_W - 2 * PAD) - dataW * scale) / 2;
  const offsetY = PAD + ((VIEW_H - 2 * PAD) - dataH * scale) / 2;

  const toSvg = (xM: number, yM: number) => ({
    x: offsetX + (xM - minX) * scale,
    y: offsetY + (maxY - yM) * scale, // flip: engineering +y is up, SVG +y is down
  });

  const fromSvg = (svgX: number, svgY: number) => ({
    xM: minX + (svgX - offsetX) / scale,
    yM: maxY - (svgY - offsetY) / scale,
  });

  return { toSvg, fromSvg, minX, maxX, minY, maxY, scale };
}

const MODE_CURSOR: Record<CanvasMode, string> = {
  select: "cursor-pointer",
  addNode: "cursor-crosshair",
  addMember: "cursor-crosshair",
  delete: "cursor-not-allowed",
};

export default function TrussDiagram({
  nodes,
  members,
  nodeResults,
  memberResults,
  mode,
  selectedNodeId,
  pendingMemberFromId,
  onCanvasClick,
  onNodeClick,
  onMemberClick,
}: TrussDiagramProps) {
  const { toSvg, fromSvg } = computeTransform(nodes);

  const maxAbsForce = Math.max(
    1e-6,
    ...memberResults.map((m) => Math.abs(m.forceKn)),
  );

  const handleBackgroundClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!onCanvasClick) return;
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * VIEW_W;
    const svgY = ((e.clientY - rect.top) / rect.height) * VIEW_H;
    const { xM, yM } = fromSvg(svgX, svgY);
    // Snap to nearest 0.1m for tidy coordinates
    onCanvasClick(Math.round(xM * 10) / 10, Math.round(yM * 10) / 10);
  };

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      className={`h-auto w-full rounded-lg border border-slate-200 bg-white ${MODE_CURSOR[mode]}`}
      onClick={mode === "addNode" ? handleBackgroundClick : undefined}
    >
      {/* Grid */}
      <defs>
        <pattern id="grid" width={20} height={20} patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f1f5f9" strokeWidth={1} />
        </pattern>
      </defs>
      <rect width={VIEW_W} height={VIEW_H} fill="url(#grid)" />

      {/* Members */}
      {members.map((member) => {
        const a = nodes.find((n) => n.id === member.nodeAId);
        const b = nodes.find((n) => n.id === member.nodeBId);
        if (!a || !b) return null;
        const pa = toSvg(a.xM, a.yM);
        const pb = toSvg(b.xM, b.yM);
        const r = memberResults.find((m) => m.memberId === member.id);
        const force = r?.forceKn ?? 0;
        const color =
          force > 0.01 ? "#2563eb" : force < -0.01 ? "#ea580c" : "#94a3b8";
        const strokeWidth = 2 + 4 * (Math.abs(force) / maxAbsForce);
        const midX = (pa.x + pb.x) / 2;
        const midY = (pa.y + pb.y) / 2;

        return (
          <g
            key={member.id}
            onClick={(e) => {
              if (mode === "delete") {
                e.stopPropagation();
                onMemberClick?.(member.id);
              }
            }}
            className={mode === "delete" ? "cursor-pointer" : ""}
          >
            <line
              x1={pa.x}
              y1={pa.y}
              x2={pb.x}
              y2={pb.y}
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
            {r && (
              <>
                <rect x={midX - 20} y={midY - 9} width={40} height={16} fill="white" opacity={0.85} />
                <text x={midX} y={midY + 3} textAnchor="middle" fontSize={11} fill={color} fontWeight={600}>
                  {force.toFixed(1)}
                </text>
              </>
            )}
          </g>
        );
      })}

      {/* Supports */}
      {nodes
        .filter((n) => n.fixX || n.fixY)
        .map((n) => {
          const p = toSvg(n.xM, n.yM);
          return (
            <g key={`support-${n.id}`}>
              <polygon
                points={`${p.x},${p.y + 6} ${p.x - 9},${p.y + 20} ${p.x + 9},${p.y + 20}`}
                fill="#475569"
              />
              <line x1={p.x - 13} y1={p.y + 20} x2={p.x + 13} y2={p.y + 20} stroke="#475569" strokeWidth={2} />
            </g>
          );
        })}

      {/* Load arrows */}
      {nodes
        .filter((n) => n.loadFxKn !== 0 || n.loadFyKn !== 0)
        .map((n) => {
          const p = toSvg(n.xM, n.yM);
          const angle = Math.atan2(-n.loadFyKn, n.loadFxKn);
          const len = 45;
          const tipX = p.x + len * Math.cos(angle);
          const tipY = p.y + len * Math.sin(angle);
          const headA = angle + Math.PI * 0.85;
          const headB = angle - Math.PI * 0.85;
          const headLen = 8;
          return (
            <g key={`load-${n.id}`}>
              <line x1={p.x} y1={p.y} x2={tipX} y2={tipY} stroke="#dc2626" strokeWidth={2.5} />
              <polygon
                points={`${tipX},${tipY} ${tipX + headLen * Math.cos(headA)},${tipY + headLen * Math.sin(headA)} ${tipX + headLen * Math.cos(headB)},${tipY + headLen * Math.sin(headB)}`}
                fill="#dc2626"
              />
              <text x={tipX + 6 * Math.cos(angle)} y={tipY + 6 * Math.sin(angle) - 6} fontSize={10} fill="#dc2626" fontWeight={600}>
                {n.loadFxKn !== 0 && `Fx=${n.loadFxKn}`}
                {n.loadFxKn !== 0 && n.loadFyKn !== 0 && ", "}
                {n.loadFyKn !== 0 && `Fy=${n.loadFyKn}`}
              </text>
            </g>
          );
        })}

      {/* Nodes */}
      {nodes.map((n) => {
        const p = toSvg(n.xM, n.yM);
        const r = nodeResults.find((nr) => nr.nodeId === n.id);
        const isSelected = n.id === selectedNodeId;
        const isPendingMember = n.id === pendingMemberFromId;
        return (
          <g
            key={n.id}
            onClick={(e) => {
              if (mode === "select" || mode === "addMember" || mode === "delete") {
                e.stopPropagation();
                onNodeClick?.(n.id);
              }
            }}
            className={mode !== "addNode" ? "cursor-pointer" : ""}
          >
            <circle
              cx={p.x}
              cy={p.y}
              r={isSelected || isPendingMember ? 9 : 6}
              fill={isPendingMember ? "#16a34a" : isSelected ? "#2563eb" : "#0f172a"}
              stroke={isSelected || isPendingMember ? "#fff" : "none"}
              strokeWidth={2}
            />
            <text x={p.x + 10} y={p.y - 8} fontSize={12} fill="#0f172a" fontWeight={600}>
              {n.id}
            </text>
            {r && (Math.abs(r.dxMm) > 0.001 || Math.abs(r.dyMm) > 0.001) && (
              <text x={p.x + 10} y={p.y + 14} fontSize={9} fill="#64748b">
                δ=({r.dxMm.toFixed(1)},{r.dyMm.toFixed(1)})mm
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
