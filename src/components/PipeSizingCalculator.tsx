"use client";

import { useMemo, useState } from "react";
import {
  calculatePipeSizing,
  FITTING_OPTIONS,
  type Application,
  type PipeMaterial,
  type PipeSizingInput,
} from "@/lib/calculations/pipeSizing";

const MATERIAL_LABEL: Record<PipeMaterial, string> = {
  steel: "เหล็ก (Commercial Steel, SCH40)",
  galvanized: "เหล็กชุบสังกะสี (Galvanized, SCH40)",
  pvc: "PVC (PN10)",
};

const APPLICATION_LABEL: Record<Application, string> = {
  coldWater: "น้ำเย็น / น้ำประปา (1–3 m/s)",
  hotWater: "น้ำร้อน (1–2 m/s)",
  custom: "กำหนดเอง",
};

const DEFAULT_INPUT: PipeSizingInput = {
  flowRateLpm: 200,
  material: "steel",
  waterTempC: 20,
  pipeLengthM: 30,
  application: "coldWater",
  fittingCounts: {
    elbow90std: 4,
    gateValve: 2,
    checkValve: 1,
  },
};

function fmt(n: number, digits = 2) {
  if (!Number.isFinite(n)) return "-";
  return n.toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export default function PipeSizingCalculator() {
  const [input, setInput] = useState<PipeSizingInput>(DEFAULT_INPUT);

  const output = useMemo(() => calculatePipeSizing(input), [input]);
  const recommended = output.results[output.recommendedIndex];

  const update = <K extends keyof PipeSizingInput>(
    key: K,
    value: PipeSizingInput[K],
  ) => setInput((prev) => ({ ...prev, [key]: value }));

  const updateFitting = (key: string, count: number) =>
    setInput((prev) => ({
      ...prev,
      fittingCounts: { ...prev.fittingCounts, [key]: count },
    }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-slate-900">
        คำนวณขนาดท่อ (Pipe Sizing)
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        อ้างอิงวิธีคำนวณตามเนื้อหา ME444 — Continuity, Reynolds Number,
        Darcy-Weisbach, Swamee-Jain
      </p>

      <div className="mt-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        ⚠️ ผลลัพธ์นี้เป็นเครื่องมือช่วยประมาณการสำหรับการเรียน/ออกแบบเบื้องต้นเท่านั้น
        ก่อนนำไปใช้ก่อสร้างจริง กรุณาให้วิศวกรที่มีใบอนุญาตตรวจสอบผลลัพธ์อีกครั้ง
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[380px_1fr]">
        {/* Inputs */}
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-medium text-slate-900">ข้อมูลระบบ</h2>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-slate-700">อัตราการไหล (Flow Rate)</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900"
                value={input.flowRateLpm}
                onChange={(e) => update("flowRateLpm", Number(e.target.value))}
              />
              <span className="w-20 shrink-0 text-slate-500">LPM</span>
            </div>
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-slate-700">วัสดุท่อ</span>
            <select
              className="rounded-md border border-slate-300 px-3 py-2 text-slate-900"
              value={input.material}
              onChange={(e) => update("material", e.target.value as PipeMaterial)}
            >
              {(Object.keys(MATERIAL_LABEL) as PipeMaterial[]).map((key) => (
                <option key={key} value={key}>
                  {MATERIAL_LABEL[key]}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-slate-700">อุณหภูมิน้ำ</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900"
                value={input.waterTempC}
                onChange={(e) => update("waterTempC", Number(e.target.value))}
              />
              <span className="w-20 shrink-0 text-slate-500">°C</span>
            </div>
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-slate-700">ความยาวท่อรวม</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900"
                value={input.pipeLengthM}
                onChange={(e) => update("pipeLengthM", Number(e.target.value))}
              />
              <span className="w-20 shrink-0 text-slate-500">m</span>
            </div>
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-slate-700">การใช้งาน (กำหนดช่วงความเร็วแนะนำ)</span>
            <select
              className="rounded-md border border-slate-300 px-3 py-2 text-slate-900"
              value={input.application}
              onChange={(e) =>
                update("application", e.target.value as Application)
              }
            >
              {(Object.keys(APPLICATION_LABEL) as Application[]).map((key) => (
                <option key={key} value={key}>
                  {APPLICATION_LABEL[key]}
                </option>
              ))}
            </select>
          </label>

          {input.application === "custom" && (
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-slate-700">Vmin</span>
                <input
                  type="number"
                  className="rounded-md border border-slate-300 px-3 py-2 text-slate-900"
                  value={input.customVelocityMin ?? 0.5}
                  onChange={(e) =>
                    update("customVelocityMin", Number(e.target.value))
                  }
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-slate-700">Vmax</span>
                <input
                  type="number"
                  className="rounded-md border border-slate-300 px-3 py-2 text-slate-900"
                  value={input.customVelocityMax ?? 3}
                  onChange={(e) =>
                    update("customVelocityMax", Number(e.target.value))
                  }
                />
              </label>
            </div>
          )}

          <h2 className="pt-2 font-medium text-slate-900">
            อุปกรณ์ประกอบท่อ (Minor Loss)
          </h2>
          <div className="grid grid-cols-2 gap-x-3 gap-y-2">
            {FITTING_OPTIONS.map((opt) => (
              <label key={opt.key} className="flex flex-col gap-1 text-xs">
                <span className="text-slate-600">
                  {opt.label} (K={opt.k})
                </span>
                <input
                  type="number"
                  min={0}
                  className="rounded-md border border-slate-300 px-2 py-1.5 text-slate-900"
                  value={input.fittingCounts[opt.key] ?? 0}
                  onChange={(e) =>
                    updateFitting(opt.key, Number(e.target.value))
                  }
                />
              </label>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {recommended && (
            <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-5">
              <div className="text-sm text-emerald-800">ขนาดท่อที่แนะนำ</div>
              <div className="text-2xl font-semibold text-emerald-900">
                {recommended.size.label}
              </div>
              <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-emerald-900 sm:grid-cols-4">
                <div>v = {fmt(recommended.velocityMs)} m/s</div>
                <div>Re = {fmt(recommended.reynolds, 0)}</div>
                <div>
                  hL = {fmt(recommended.totalHeadLossM)} m (
                  {fmt(recommended.totalPressureDropPa, 0)} Pa)
                </div>
                <div>ΔP/L = {fmt(recommended.pressureDropPaPerM, 0)} Pa/m</div>
              </div>
              <div className="mt-2 text-xs text-emerald-800">
                Flow regime: {recommended.flowRegime} · f ={" "}
                {fmt(recommended.frictionFactor, 4)} ·{" "}
                {recommended.velocityInRange
                  ? "ความเร็วอยู่ในช่วงแนะนำ ✓"
                  : "ความเร็วอยู่นอกช่วงแนะนำ — โปรดพิจารณาขนาดอื่น ⚠️"}
              </div>
            </div>
          )}

          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-slate-600">
                  <th className="px-3 py-2 font-medium">ขนาดท่อ</th>
                  <th className="px-3 py-2 font-medium">ID (mm)</th>
                  <th className="px-3 py-2 font-medium">v (m/s)</th>
                  <th className="px-3 py-2 font-medium">Re</th>
                  <th className="px-3 py-2 font-medium">Regime</th>
                  <th className="px-3 py-2 font-medium">hL (m)</th>
                  <th className="px-3 py-2 font-medium">ΔP (Pa)</th>
                  <th className="px-3 py-2 font-medium">ΔP/L (Pa/m)</th>
                  <th className="px-3 py-2 font-medium">v เหมาะสม?</th>
                </tr>
              </thead>
              <tbody>
                {output.results.map((r, idx) => (
                  <tr
                    key={r.size.label}
                    className={
                      idx === output.recommendedIndex
                        ? "bg-emerald-50 font-medium"
                        : "border-b border-slate-100 last:border-0"
                    }
                  >
                    <td className="px-3 py-2">{r.size.label}</td>
                    <td className="px-3 py-2">{fmt(r.size.idMm, 1)}</td>
                    <td className="px-3 py-2">{fmt(r.velocityMs)}</td>
                    <td className="px-3 py-2">{fmt(r.reynolds, 0)}</td>
                    <td className="px-3 py-2">{r.flowRegime}</td>
                    <td className="px-3 py-2">{fmt(r.totalHeadLossM)}</td>
                    <td className="px-3 py-2">{fmt(r.totalPressureDropPa, 0)}</td>
                    <td className="px-3 py-2">{fmt(r.pressureDropPaPerM, 0)}</td>
                    <td className="px-3 py-2">
                      {r.velocityInRange ? "✓" : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 text-xs text-slate-500 shadow-sm">
            ρ (ความหนาแน่นน้ำ) ={" "}
            {fmt(output.rho, 1)} kg/m³ · ν (viscosity) ={" "}
            {output.nu.toExponential(3)} m²/s · ผลรวม K จากอุปกรณ์ ={" "}
            {fmt(output.totalK, 2)} · ช่วงความเร็วแนะนำ:{" "}
            {fmt(output.velocityRange.min, 1)}–{fmt(output.velocityRange.max, 1)}{" "}
            m/s
          </div>
        </div>
      </div>
    </div>
  );
}
