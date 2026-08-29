"use client";

import { useMemo, useState } from "react";
import {
  TYPICAL_DESIGN_MINIMUM_FS,
  calculateSlopeStability,
  type SlopeStabilityInput,
} from "@/lib/calculations/slopeStability";
import { NumberField } from "@/components/ui/NumberField";
import { WarningBanner } from "@/components/ui/WarningBanner";
import { fmt } from "@/lib/format";

const DEFAULT_INPUT: SlopeStabilityInput = {
  cohesionKpa: 15,
  frictionAngleDeg: 30,
  unitWeightKnM3: 18,
  slopeAngleDeg: 25,
  depthM: 4,
};

export default function SlopeStabilityCalculator() {
  const [input, setInput] = useState<SlopeStabilityInput>(DEFAULT_INPUT);
  const result = useMemo(() => calculateSlopeStability(input), [input]);

  const update = <K extends keyof SlopeStabilityInput>(
    key: K,
    value: SlopeStabilityInput[K],
  ) => setInput((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-slate-900">
        เสถียรภาพลาดดิน (Slope Stability — Infinite Slope Method)
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        คำนวณ Factor of Safety สำหรับลาดดิน/หน้าเหมืองแบบ Planar Failure ขนานกับหน้าลาด
      </p>

      <WarningBanner>
        ⚠️ ใช้แบบจำลอง Dry Infinite Slope เท่านั้น (ไม่รวมผลระดับน้ำใต้ดิน/แรงดันน้ำในรูพรุน ซึ่งลด
        FS ลงได้มาก) เหมาะกับลาดดินสม่ำเสมอความยาวมาก ไม่ใช่ Circular/Wedge Failure
        กรุณาให้วิศวกรธรณีเทคนิค/เหมืองแร่ที่มีใบอนุญาตตรวจสอบและสำรวจน้ำใต้ดินจริงก่อนออกแบบ
      </WarningBanner>

      <div className="mt-8 grid grid-cols-1 items-start gap-8 lg:grid-cols-[380px_1fr]">
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-medium text-slate-900">คุณสมบัติวัสดุ</h2>
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label="แรงยึดเหนี่ยว (c)"
              unit="kPa"
              value={input.cohesionKpa}
              onChange={(v) => update("cohesionKpa", v)}
            />
            <NumberField
              label="มุมเสียดทานภายใน (φ)"
              unit="°"
              value={input.frictionAngleDeg}
              onChange={(v) => update("frictionAngleDeg", v)}
            />
          </div>
          <NumberField
            label="หน่วยน้ำหนัก (γ)"
            unit="kN/m³"
            value={input.unitWeightKnM3}
            onChange={(v) => update("unitWeightKnM3", v)}
          />

          <h2 className="pt-2 font-medium text-slate-900">รูปทรงลาดดิน</h2>
          <NumberField
            label="มุมลาด (β)"
            unit="°"
            value={input.slopeAngleDeg}
            onChange={(v) => update("slopeAngleDeg", v)}
          />
          <NumberField
            label="ความลึกผิววิบัติ (z)"
            unit="m"
            value={input.depthM}
            step={0.5}
            onChange={(v) => update("depthM", v)}
          />
        </div>

        <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
          <div
            className={`rounded-xl border p-5 ${
              result.meetsTypicalDesignMinimum
                ? "border-emerald-300 bg-emerald-50"
                : result.isStable
                  ? "border-amber-300 bg-amber-50"
                  : "border-red-300 bg-red-50"
            }`}
          >
            <div className="text-sm text-slate-700">Factor of Safety (FS)</div>
            <div
              className={`text-2xl font-semibold ${
                result.meetsTypicalDesignMinimum
                  ? "text-emerald-900"
                  : result.isStable
                    ? "text-amber-900"
                    : "text-red-900"
              }`}
            >
              {fmt(result.factorOfSafety, 3)}
            </div>
            <div className="mt-2 text-xs">
              {!result.isStable
                ? "⚠️ FS < 1 — ลาดดินไม่เสถียร คาดว่าจะวิบัติ ต้องลดความชันหรือเสริมกำลัง"
                : result.meetsTypicalDesignMinimum
                  ? `✓ FS ≥ ${TYPICAL_DESIGN_MINIMUM_FS} (เกณฑ์ออกแบบทั่วไปสำหรับลาดถาวร)`
                  : `⚠️ FS ≥ 1 แต่ต่ำกว่าเกณฑ์ออกแบบทั่วไป (${TYPICAL_DESIGN_MINIMUM_FS}) — ความเสี่ยงสูงกว่าที่ยอมรับได้`}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm shadow-sm">
            <h3 className="mb-2 font-medium text-slate-900">องค์ประกอบ FS</h3>
            <div className="flex justify-between border-b border-slate-100 py-1.5">
              <span className="text-slate-600">Friction Term (tanφ/tanβ)</span>
              <span className="font-medium text-slate-900">
                {fmt(result.frictionTermFs, 3)}
              </span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-600">Cohesion Term (c/(γ·z·sinβ·cosβ))</span>
              <span className="font-medium text-slate-900">
                {fmt(result.cohesionTermFs, 3)}
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">
            <h3 className="mb-2 font-medium text-slate-900">สูตรที่ใช้</h3>
            <p className="font-mono text-xs text-slate-500">
              FS = tan(φ)/tan(β) + c / (γ·z·sin(β)·cos(β))
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
