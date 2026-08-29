"use client";

import { useMemo, useState } from "react";
import {
  calculateTrussAnalysis,
  type TrussInput,
  type TrussMember,
  type TrussNode,
} from "@/lib/calculations/trussAnalysis";
import { NumberField } from "@/components/ui/NumberField";
import { WarningBanner } from "@/components/ui/WarningBanner";
import { fmt } from "@/lib/format";

// Default: the reference three-bar truss (matches trussAnalysis.test.ts)
const DEFAULT_NODES: TrussNode[] = [
  { id: 1, xM: -4, yM: 6, fixX: true, fixY: true, loadFxKn: 0, loadFyKn: 0 },
  { id: 2, xM: 0, yM: 6, fixX: true, fixY: true, loadFxKn: 0, loadFyKn: 0 },
  { id: 3, xM: 4, yM: 6, fixX: true, fixY: true, loadFxKn: 0, loadFyKn: 0 },
  { id: 4, xM: 0, yM: 0, fixX: false, fixY: false, loadFxKn: 100, loadFyKn: -100 },
];

const DEFAULT_MEMBERS: TrussMember[] = [
  { id: 1, nodeAId: 1, nodeBId: 4, areaMm2: 5000 },
  { id: 2, nodeAId: 2, nodeBId: 4, areaMm2: 5000 },
  { id: 3, nodeAId: 3, nodeBId: 4, areaMm2: 5000 },
];

let nextNodeId = 5;
let nextMemberId = 4;

export default function TrussAnalysisCalculator() {
  const [nodes, setNodes] = useState<TrussNode[]>(DEFAULT_NODES);
  const [members, setMembers] = useState<TrussMember[]>(DEFAULT_MEMBERS);
  const [elasticModulusGpa, setElasticModulusGpa] = useState(200);

  const input: TrussInput = useMemo(
    () => ({ nodes, members, elasticModulusGpa }),
    [nodes, members, elasticModulusGpa],
  );
  const result = useMemo(() => calculateTrussAnalysis(input), [input]);

  const updateNode = (id: number, patch: Partial<TrussNode>) =>
    setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, ...patch } : n)));

  const updateMember = (id: number, patch: Partial<TrussMember>) =>
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));

  const addNode = () => {
    const id = nextNodeId++;
    setNodes((prev) => [
      ...prev,
      { id, xM: 0, yM: 0, fixX: false, fixY: false, loadFxKn: 0, loadFyKn: 0 },
    ]);
  };
  const removeNode = (id: number) => {
    setNodes((prev) => prev.filter((n) => n.id !== id));
    setMembers((prev) => prev.filter((m) => m.nodeAId !== id && m.nodeBId !== id));
  };

  const addMember = () => {
    if (nodes.length < 2) return;
    const id = nextMemberId++;
    setMembers((prev) => [
      ...prev,
      { id, nodeAId: nodes[0].id, nodeBId: nodes[1].id, areaMm2: 1000 },
    ]);
  };
  const removeMember = (id: number) =>
    setMembers((prev) => prev.filter((m) => m.id !== id));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-slate-900">
        วิเคราะห์โครงถัก 2 มิติ (2D Truss Analysis — Direct Stiffness Method)
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        วิธีการเชิงตัวเลขจริง (matrix stiffness method) ไม่ใช่สูตรสำเร็จรูป — คำนวณ
        แรงในชิ้นส่วน, การเคลื่อนตัวของจุดต่อ และแรงปฏิกิริยา จากรูปทรง โครงสร้าง
        และโหลดที่กำหนดเอง
      </p>

      <WarningBanner>
        ⚠️ รองรับเฉพาะโครงถักหมุดยึด (pin-jointed, รับแรงตามแนวแกนอย่างเดียว) ใน 2 มิติ
        เท่านั้น ไม่รวมการดัด (bending), การโก่งเดาะ (buckling), หรือน้ำหนักตัวเอง
        ของชิ้นส่วน ตรวจสอบผลลัพธ์กับการคำนวณอิสระก่อนใช้งานจริงเสมอ และให้วิศวกร
        โครงสร้างที่มีใบอนุญาตเซ็นรับรอง
      </WarningBanner>

      {!result.isStable && (
        <div className="mt-3 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900">
          ⚠️ โครงสร้างไม่เสถียร (Unstable Mechanism) — จุดรองรับหรือจำนวนชิ้นส่วนไม่พอที่จะ
          ต้านทานโหลด กรุณาเพิ่มจุดรองรับหรือชิ้นส่วนค้ำยัน
        </div>
      )}

      <div className="mt-8 space-y-6">
        <NumberField
          label="Elastic Modulus (E) — ใช้ร่วมกันทุกชิ้นส่วน"
          unit="GPa"
          value={elasticModulusGpa}
          onChange={setElasticModulusGpa}
        />

        {/* Nodes table */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-medium text-slate-900">จุดต่อ (Nodes)</h2>
            <button
              onClick={addNode}
              className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-700"
            >
              + เพิ่มจุดต่อ
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500">
                  <th className="px-2 py-1.5 font-medium">ID</th>
                  <th className="px-2 py-1.5 font-medium">x (m)</th>
                  <th className="px-2 py-1.5 font-medium">y (m)</th>
                  <th className="px-2 py-1.5 font-medium">ยึด X</th>
                  <th className="px-2 py-1.5 font-medium">ยึด Y</th>
                  <th className="px-2 py-1.5 font-medium">Fx (kN)</th>
                  <th className="px-2 py-1.5 font-medium">Fy (kN)</th>
                  <th className="px-2 py-1.5 font-medium">δx (mm)</th>
                  <th className="px-2 py-1.5 font-medium">δy (mm)</th>
                  <th className="px-2 py-1.5"></th>
                </tr>
              </thead>
              <tbody>
                {nodes.map((node) => {
                  const r = result.nodeResults.find((n) => n.nodeId === node.id);
                  return (
                    <tr key={node.id} className="border-b border-slate-100 last:border-0">
                      <td className="px-2 py-1.5 font-medium">{node.id}</td>
                      <td className="px-2 py-1.5">
                        <input
                          type="number"
                          className="w-20 rounded border border-slate-300 px-1.5 py-1"
                          value={node.xM}
                          onChange={(e) => updateNode(node.id, { xM: Number(e.target.value) })}
                        />
                      </td>
                      <td className="px-2 py-1.5">
                        <input
                          type="number"
                          className="w-20 rounded border border-slate-300 px-1.5 py-1"
                          value={node.yM}
                          onChange={(e) => updateNode(node.id, { yM: Number(e.target.value) })}
                        />
                      </td>
                      <td className="px-2 py-1.5 text-center">
                        <input
                          type="checkbox"
                          checked={node.fixX}
                          onChange={(e) => updateNode(node.id, { fixX: e.target.checked })}
                        />
                      </td>
                      <td className="px-2 py-1.5 text-center">
                        <input
                          type="checkbox"
                          checked={node.fixY}
                          onChange={(e) => updateNode(node.id, { fixY: e.target.checked })}
                        />
                      </td>
                      <td className="px-2 py-1.5">
                        <input
                          type="number"
                          className="w-20 rounded border border-slate-300 px-1.5 py-1"
                          value={node.loadFxKn}
                          onChange={(e) =>
                            updateNode(node.id, { loadFxKn: Number(e.target.value) })
                          }
                        />
                      </td>
                      <td className="px-2 py-1.5">
                        <input
                          type="number"
                          className="w-20 rounded border border-slate-300 px-1.5 py-1"
                          value={node.loadFyKn}
                          onChange={(e) =>
                            updateNode(node.id, { loadFyKn: Number(e.target.value) })
                          }
                        />
                      </td>
                      <td className="px-2 py-1.5 text-slate-600">
                        {r ? fmt(r.dxMm, 2) : "-"}
                      </td>
                      <td className="px-2 py-1.5 text-slate-600">
                        {r ? fmt(r.dyMm, 2) : "-"}
                      </td>
                      <td className="px-2 py-1.5">
                        <button
                          onClick={() => removeNode(node.id)}
                          className="text-xs text-red-600 hover:underline"
                        >
                          ลบ
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Members table */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-medium text-slate-900">ชิ้นส่วน (Members)</h2>
            <button
              onClick={addMember}
              className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-700"
            >
              + เพิ่มชิ้นส่วน
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500">
                  <th className="px-2 py-1.5 font-medium">ID</th>
                  <th className="px-2 py-1.5 font-medium">จุดต่อ A</th>
                  <th className="px-2 py-1.5 font-medium">จุดต่อ B</th>
                  <th className="px-2 py-1.5 font-medium">พื้นที่หน้าตัด (mm²)</th>
                  <th className="px-2 py-1.5 font-medium">ความยาว (m)</th>
                  <th className="px-2 py-1.5 font-medium">แรงตามแนวแกน (kN)</th>
                  <th className="px-2 py-1.5 font-medium">ความเค้น (MPa)</th>
                  <th className="px-2 py-1.5 font-medium">สถานะ</th>
                  <th className="px-2 py-1.5"></th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => {
                  const r = result.memberResults.find((m) => m.memberId === member.id);
                  const isTension = (r?.forceKn ?? 0) > 0.001;
                  const isCompression = (r?.forceKn ?? 0) < -0.001;
                  return (
                    <tr key={member.id} className="border-b border-slate-100 last:border-0">
                      <td className="px-2 py-1.5 font-medium">{member.id}</td>
                      <td className="px-2 py-1.5">
                        <select
                          className="rounded border border-slate-300 px-1.5 py-1"
                          value={member.nodeAId}
                          onChange={(e) =>
                            updateMember(member.id, { nodeAId: Number(e.target.value) })
                          }
                        >
                          {nodes.map((n) => (
                            <option key={n.id} value={n.id}>
                              {n.id}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-2 py-1.5">
                        <select
                          className="rounded border border-slate-300 px-1.5 py-1"
                          value={member.nodeBId}
                          onChange={(e) =>
                            updateMember(member.id, { nodeBId: Number(e.target.value) })
                          }
                        >
                          {nodes.map((n) => (
                            <option key={n.id} value={n.id}>
                              {n.id}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-2 py-1.5">
                        <input
                          type="number"
                          className="w-24 rounded border border-slate-300 px-1.5 py-1"
                          value={member.areaMm2}
                          onChange={(e) =>
                            updateMember(member.id, { areaMm2: Number(e.target.value) })
                          }
                        />
                      </td>
                      <td className="px-2 py-1.5 text-slate-600">
                        {r ? fmt(r.lengthM, 2) : "-"}
                      </td>
                      <td className="px-2 py-1.5 font-medium text-slate-900">
                        {r ? fmt(r.forceKn, 2) : "-"}
                      </td>
                      <td className="px-2 py-1.5 text-slate-600">
                        {r ? fmt(r.stressMpa, 1) : "-"}
                      </td>
                      <td className="px-2 py-1.5">
                        {isTension && (
                          <span className="text-blue-600">ดึง (Tension)</span>
                        )}
                        {isCompression && (
                          <span className="text-orange-600">อัด (Compression)</span>
                        )}
                      </td>
                      <td className="px-2 py-1.5">
                        <button
                          onClick={() => removeMember(member.id)}
                          className="text-xs text-red-600 hover:underline"
                        >
                          ลบ
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {result.isStable && (
          <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm shadow-sm">
            <h2 className="mb-2 font-medium text-slate-900">แรงปฏิกิริยา (Reactions)</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {result.nodeResults
                .filter((n) => n.reactionFxKn !== 0 || n.reactionFyKn !== 0)
                .map((n) => (
                  <div key={n.nodeId} className="rounded-md bg-slate-50 px-3 py-2">
                    <div className="text-xs text-slate-500">จุดต่อ {n.nodeId}</div>
                    <div className="text-slate-900">
                      Rx = {fmt(n.reactionFxKn)} kN, Ry = {fmt(n.reactionFyKn)} kN
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
