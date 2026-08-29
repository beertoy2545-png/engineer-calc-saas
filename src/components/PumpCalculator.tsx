"use client";

import { useMemo, useState } from "react";
import {
  PIPE_SIZE_TABLES,
  calculateNpsh,
  calculatePumpHeadPower,
  type NpshInput,
  type PipeMaterial,
  type PumpHeadPowerInput,
} from "@/lib/calculations/pumpPower";
import { NumberField as Field } from "@/components/ui/NumberField";
import { WarningBanner } from "@/components/ui/WarningBanner";
import { fmt } from "@/lib/format";

const MATERIAL_LABEL: Record<PipeMaterial, string> = {
  steel: "เหล็ก (Commercial Steel, SCH40)",
  galvanized: "เหล็กชุบสังกะสี (Galvanized, SCH40)",
  pvc: "PVC (PN10)",
};

const DEFAULT_HEAD_POWER: PumpHeadPowerInput = {
  flowRateLpm: 600,
  staticHeadM: 15,
  frictionHeadLossM: 5,
  waterTempC: 30,
  designMarginPct: 10,
  pumpEfficiencyPct: 70,
  motorEfficiencyPct: 90,
};

// Defaults match the textbook's worked Example 6.1 (Chapter 6) so the
// result can be checked against the book's answer: NPSHA ≈ 3.2 m.WA.
const DEFAULT_NPSH: NpshInput = {
  siteAltitudeM: 1000,
  waterTempC: 30,
  suctionStaticLiftM: 4,
  suctionMaterial: "steel",
  suctionPipeIdMm: 77.93,
  suctionLengthM: 18,
  suctionFlowLpm: 600,
  minorLossMarginPct: 50,
  npshRequiredM: 5,
};

export default function PumpCalculator() {
  const [headPowerInput, setHeadPowerInput] =
    useState<PumpHeadPowerInput>(DEFAULT_HEAD_POWER);
  const [npshInput, setNpshInput] = useState<NpshInput>(DEFAULT_NPSH);

  const headPowerResult = useMemo(
    () => calculatePumpHeadPower(headPowerInput),
    [headPowerInput],
  );
  const npshResult = useMemo(() => calculateNpsh(npshInput), [npshInput]);

  const updateHP = <K extends keyof PumpHeadPowerInput>(
    key: K,
    value: PumpHeadPowerInput[K],
  ) => setHeadPowerInput((prev) => ({ ...prev, [key]: value }));

  const updateNpsh = <K extends keyof NpshInput>(
    key: K,
    value: NpshInput[K],
  ) => setNpshInput((prev) => ({ ...prev, [key]: value }));

  const suctionSizes = PIPE_SIZE_TABLES[npshInput.suctionMaterial];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-slate-900">
        คำนวณปั๊มน้ำ (Pump Head, Power & NPSH)
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        อ้างอิงสูตรบทที่ 6 ME444 — Fluid/Shaft Power (eq. 6.1–6.2), NPSH
        Available (eq. 6.8)
      </p>

      <WarningBanner>
        ⚠️ เครื่องมือนี้ช่วยประมาณการเบื้องต้นเท่านั้น การเลือกปั๊มจริงต้องอ้างอิง
        Pump Curve และค่า NPSHR จาก datasheet ของผู้ผลิตเสมอ
        กรุณาให้วิศวกรที่มีใบอนุญาตตรวจสอบก่อนติดตั้งจริง
      </WarningBanner>

      {/* Section 1: Head & Power */}
      <div className="mt-8 grid grid-cols-1 items-start gap-8 lg:grid-cols-[380px_1fr]">
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-medium text-slate-900">1. Head &amp; Power</h2>
          <Field
            label="อัตราการไหล"
            unit="LPM"
            value={headPowerInput.flowRateLpm}
            onChange={(v) => updateHP("flowRateLpm", v)}
          />
          <Field
            label="Static Head (ยกระดับ)"
            unit="m"
            value={headPowerInput.staticHeadM}
            onChange={(v) => updateHP("staticHeadM", v)}
          />
          <Field
            label="Friction Head Loss"
            unit="m"
            value={headPowerInput.frictionHeadLossM}
            onChange={(v) => updateHP("frictionHeadLossM", v)}
          />
          <p className="text-xs text-slate-400">
            * หาค่านี้ได้จากเครื่องมือ Pipe Sizing (คอลัมน์ hL)
          </p>
          <Field
            label="อุณหภูมิน้ำ"
            unit="°C"
            value={headPowerInput.waterTempC}
            onChange={(v) => updateHP("waterTempC", v)}
          />
          <Field
            label="Design Margin"
            unit="%"
            value={headPowerInput.designMarginPct}
            onChange={(v) => updateHP("designMarginPct", v)}
          />
          <Field
            label="Pump Efficiency"
            unit="%"
            value={headPowerInput.pumpEfficiencyPct}
            onChange={(v) => updateHP("pumpEfficiencyPct", v)}
          />
          <Field
            label="Motor Efficiency"
            unit="%"
            value={headPowerInput.motorEfficiencyPct}
            onChange={(v) => updateHP("motorEfficiencyPct", v)}
          />
        </div>

        <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
          <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-5">
            <div className="text-sm text-emerald-800">ขนาดมอเตอร์ที่แนะนำ</div>
            <div className="text-2xl font-semibold text-emerald-900">
              {headPowerResult.recommendedMotorKw} kW
            </div>
            <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-emerald-900 sm:grid-cols-4">
              <div>TDH = {fmt(headPowerResult.tdhM)} m</div>
              <div>
                TDH (+margin) = {fmt(headPowerResult.tdhWithMarginM)} m
              </div>
              <div>Fluid Power = {fmt(headPowerResult.fluidPowerKw)} kW</div>
              <div>Shaft Power = {fmt(headPowerResult.shaftPowerKw)} kW</div>
            </div>
            <div className="mt-1 text-xs text-emerald-800">
              Motor Input Power ที่ต้องการจริง ={" "}
              {fmt(headPowerResult.motorInputPowerKw)} kW
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: NPSH */}
      <div className="mt-10 grid grid-cols-1 items-start gap-8 lg:grid-cols-[380px_1fr]">
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-medium text-slate-900">
            2. NPSH Check (ป้องกัน Cavitation)
          </h2>
          <Field
            label="ระดับความสูงของสถานที่ติดตั้ง"
            unit="m"
            value={npshInput.siteAltitudeM}
            onChange={(v) => updateNpsh("siteAltitudeM", v)}
          />
          <Field
            label="อุณหภูมิน้ำ"
            unit="°C"
            value={npshInput.waterTempC}
            onChange={(v) => updateNpsh("waterTempC", v)}
          />
          <Field
            label="Static Suction Lift (z)"
            unit="m"
            value={npshInput.suctionStaticLiftM}
            onChange={(v) => updateNpsh("suctionStaticLiftM", v)}
          />
          <p className="text-xs text-slate-400">
            * z เป็นบวกถ้าปั๊มอยู่สูงกว่าระดับน้ำ (suction lift) ถ้าปั๊มอยู่ต่ำกว่า
            (flooded suction) ให้ใส่เป็นค่าลบ
          </p>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-slate-700">วัสดุท่อดูด</span>
            <select
              className="rounded-md border border-slate-300 px-3 py-2 text-slate-900"
              value={npshInput.suctionMaterial}
              onChange={(e) => {
                const material = e.target.value as PipeMaterial;
                const firstSize = PIPE_SIZE_TABLES[material][0];
                setNpshInput((prev) => ({
                  ...prev,
                  suctionMaterial: material,
                  suctionPipeIdMm: firstSize.idMm,
                }));
              }}
            >
              {(Object.keys(MATERIAL_LABEL) as PipeMaterial[]).map((key) => (
                <option key={key} value={key}>
                  {MATERIAL_LABEL[key]}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-slate-700">ขนาดท่อดูด</span>
            <select
              className="rounded-md border border-slate-300 px-3 py-2 text-slate-900"
              value={npshInput.suctionPipeIdMm}
              onChange={(e) =>
                updateNpsh("suctionPipeIdMm", Number(e.target.value))
              }
            >
              {suctionSizes.map((size) => (
                <option key={size.label} value={size.idMm}>
                  {size.label}
                </option>
              ))}
            </select>
          </label>

          <Field
            label="อัตราการไหล"
            unit="LPM"
            value={npshInput.suctionFlowLpm}
            onChange={(v) => updateNpsh("suctionFlowLpm", v)}
          />
          <Field
            label="ความยาวท่อดูด"
            unit="m"
            value={npshInput.suctionLengthM}
            onChange={(v) => updateNpsh("suctionLengthM", v)}
          />
          <Field
            label="Minor Loss Margin"
            unit="%"
            value={npshInput.minorLossMarginPct}
            onChange={(v) => updateNpsh("minorLossMarginPct", v)}
          />
          <Field
            label="NPSH Required (จาก datasheet ปั๊ม)"
            unit="m"
            value={npshInput.npshRequiredM}
            onChange={(v) => updateNpsh("npshRequiredM", v)}
          />
        </div>

        <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
          <div
            className={`rounded-xl border p-5 ${
              npshResult.hasCavitationRisk
                ? "border-red-300 bg-red-50"
                : "border-emerald-300 bg-emerald-50"
            }`}
          >
            <div
              className={
                npshResult.hasCavitationRisk
                  ? "text-sm text-red-800"
                  : "text-sm text-emerald-800"
              }
            >
              NPSH Available
            </div>
            <div
              className={`text-2xl font-semibold ${
                npshResult.hasCavitationRisk
                  ? "text-red-900"
                  : "text-emerald-900"
              }`}
            >
              {fmt(npshResult.npshAvailableM)} m.WA.
            </div>
            <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-4">
              <div>Patm = {fmt(npshResult.atmPressureM)} m.WA.</div>
              <div>Pvapor = {fmt(npshResult.vaporPressureM, 3)} m.WA.</div>
              <div>v(suction) = {fmt(npshResult.suctionVelocityMs)} m/s</div>
              <div>hL(suction) = {fmt(npshResult.suctionHeadLossM)} m</div>
            </div>
            <div
              className={`mt-2 text-sm font-medium ${
                npshResult.hasCavitationRisk
                  ? "text-red-900"
                  : "text-emerald-900"
              }`}
            >
              {npshResult.hasCavitationRisk
                ? `⚠️ NPSHA < NPSHR (ขาดอยู่ ${fmt(-npshResult.marginM)} m) — เสี่ยง Cavitation ควรลดความสูงติดตั้งปั๊ม, ใช้ปั๊มชนิด Split Case, หรือเพิ่มขนาดท่อดูด`
                : `✓ NPSHA เพียงพอ (ส่วนเกิน ${fmt(npshResult.marginM)} m)`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
