"use client";

import { useMemo, useState } from "react";
import {
  calculateBearingCapacity,
  type BearingCapacityInput,
  type FootingShape,
} from "@/lib/calculations/bearingCapacity";
import { NumberField } from "@/components/ui/NumberField";
import { WarningBanner } from "@/components/ui/WarningBanner";
import { fmt } from "@/lib/format";

const DEFAULT_INPUT: BearingCapacityInput = {
  frictionAngleDeg: 30,
  cohesionKpa: 20,
  surchargeKpa: 15,
  soilUnitWeightKnM3: 18,
  footingWidthM: 1.5,
  shape: "strip",
  factorOfSafety: 3,
};

const SHAPE_LABEL: Record<FootingShape, string> = {
  strip: "ฐานรากแถบยาว (Strip)",
  square: "ฐานรากสี่เหลี่ยมจัตุรัส (Square)",
  circular: "ฐานรากวงกลม (Circular)",
};

export default function BearingCapacityCalculator() {
  const [input, setInput] = useState<BearingCapacityInput>(DEFAULT_INPUT);
  const result = useMemo(() => calculateBearingCapacity(input), [input]);

  const update = <K extends keyof BearingCapacityInput>(
    key: K,
    value: BearingCapacityInput[K],
  ) => setInput((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-slate-900">
        กำลังรับน้ำหนักฐานราก (Shallow Foundation Bearing Capacity)
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        General Bearing Capacity Equation (Meyerhof N<sub>q</sub>, N<sub>c</sub> + Hansen
        N<sub>γ</sub>) — สานต่อจาก RC Beam Design สู่การออกแบบฐานราก
      </p>

      <WarningBanner>
        ⚠️ เป็นแบบจำลอง General Shear Failure อย่างง่าย ไม่รวมผลระดับน้ำใต้ดิน โหลดเยื้องศูนย์/
        เอียง ชั้นดินหลายชั้น หรือการตรวจสอบ Settlement กรุณาใช้ค่าพารามิเตอร์ดินจากผลสำรวจดิน
        จริง (SPT/CPT) และให้วิศวกรธรณีเทคนิคที่มีใบอนุญาตตรวจสอบก่อนออกแบบจริง
      </WarningBanner>

      <div className="mt-8 grid grid-cols-1 items-start gap-8 lg:grid-cols-[380px_1fr]">
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-medium text-slate-900">คุณสมบัติดิน</h2>
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label="มุมเสียดทานภายใน (φ)"
              unit="°"
              value={input.frictionAngleDeg}
              onChange={(v) => update("frictionAngleDeg", v)}
            />
            <NumberField
              label="แรงยึดเหนี่ยว (c)"
              unit="kPa"
              value={input.cohesionKpa}
              onChange={(v) => update("cohesionKpa", v)}
            />
          </div>
          <NumberField
            label="หน่วยน้ำหนักดิน (γ)"
            unit="kN/m³"
            value={input.soilUnitWeightKnM3}
            onChange={(v) => update("soilUnitWeightKnM3", v)}
          />
          <NumberField
            label="Surcharge ที่ระดับฐานราก (q = γ·Df)"
            unit="kPa"
            value={input.surchargeKpa}
            onChange={(v) => update("surchargeKpa", v)}
          />

          <h2 className="pt-2 font-medium text-slate-900">ฐานราก</h2>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-slate-700">รูปทรงฐานราก</span>
            <select
              className="rounded-md border border-slate-300 px-3 py-2 text-slate-900"
              value={input.shape}
              onChange={(e) => update("shape", e.target.value as FootingShape)}
            >
              {(Object.keys(SHAPE_LABEL) as FootingShape[]).map((key) => (
                <option key={key} value={key}>
                  {SHAPE_LABEL[key]}
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label="ความกว้างฐานราก (B)"
              unit="m"
              value={input.footingWidthM}
              step={0.1}
              onChange={(v) => update("footingWidthM", v)}
            />
            <NumberField
              label="Factor of Safety"
              value={input.factorOfSafety}
              step={0.5}
              onChange={(v) => update("factorOfSafety", v)}
            />
          </div>
        </div>

        <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
          <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-5">
            <div className="text-sm text-emerald-800">
              กำลังรับน้ำหนักที่ยอมให้ (Allowable, qa)
            </div>
            <div className="text-2xl font-semibold text-emerald-900">
              {fmt(result.allowableBearingCapacityKpa, 1)} kPa
            </div>
            <div className="mt-1 text-xs text-emerald-800">
              qu (Ultimate) = {fmt(result.ultimateBearingCapacityKpa, 1)} kPa · FS ={" "}
              {input.factorOfSafety}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm shadow-sm">
            <h3 className="mb-2 font-medium text-slate-900">
              Bearing Capacity Factors (φ={input.frictionAngleDeg}°)
            </h3>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-md bg-slate-50 p-3">
                <div className="text-xs text-slate-500">Nc</div>
                <div className="font-medium text-slate-900">
                  {fmt(result.factors.nc, 2)}
                </div>
              </div>
              <div className="rounded-md bg-slate-50 p-3">
                <div className="text-xs text-slate-500">Nq</div>
                <div className="font-medium text-slate-900">
                  {fmt(result.factors.nq, 2)}
                </div>
              </div>
              <div className="rounded-md bg-slate-50 p-3">
                <div className="text-xs text-slate-500">Nγ</div>
                <div className="font-medium text-slate-900">
                  {fmt(result.factors.ngamma, 2)}
                </div>
              </div>
            </div>

            <h3 className="mb-2 mt-4 font-medium text-slate-900">
              องค์ประกอบ qu (Component Breakdown)
            </h3>
            <div className="flex justify-between border-b border-slate-100 py-1.5">
              <span className="text-slate-600">Cohesion term (c·Nc·shape)</span>
              <span className="font-medium text-slate-900">
                {fmt(result.cohesionTermKpa, 1)} kPa
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-100 py-1.5">
              <span className="text-slate-600">Surcharge term (q·Nq)</span>
              <span className="font-medium text-slate-900">
                {fmt(result.surchargeTermKpa, 1)} kPa
              </span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-600">Self-weight term (0.5·γ·B·Nγ·shape)</span>
              <span className="font-medium text-slate-900">
                {fmt(result.weightTermKpa, 1)} kPa
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
