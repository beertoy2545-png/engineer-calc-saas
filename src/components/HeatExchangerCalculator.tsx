"use client";

import { useMemo, useState } from "react";
import {
  U_VALUE_PRESETS,
  calculateHeatExchanger,
  type FlowArrangement,
  type HeatExchangerInput,
} from "@/lib/calculations/heatExchanger";
import { NumberField } from "@/components/ui/NumberField";
import { WarningBanner } from "@/components/ui/WarningBanner";
import { fmt } from "@/lib/format";

const DEFAULT_INPUT: HeatExchangerInput = {
  flowArrangement: "counterflow",
  thInC: 90,
  thOutC: 60,
  tcInC: 20,
  tcOutC: 45,
  heatDutyKw: 500,
  overallUWm2k: 2000,
};

export default function HeatExchangerCalculator() {
  const [uPresetKey, setUPresetKey] = useState("waterWater");
  const [input, setInput] = useState<HeatExchangerInput>(DEFAULT_INPUT);
  const result = useMemo(() => calculateHeatExchanger(input), [input]);

  const update = <K extends keyof HeatExchangerInput>(
    key: K,
    value: HeatExchangerInput[K],
  ) => setInput((prev) => ({ ...prev, [key]: value }));

  const onUPresetChange = (key: string) => {
    setUPresetKey(key);
    const preset = U_VALUE_PRESETS.find((p) => p.key === key);
    if (preset && key !== "custom") update("overallUWm2k", preset.uWm2k);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-slate-900">
        คำนวณเครื่องแลกเปลี่ยนความร้อน (Heat Exchanger — LMTD Method)
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Q = U·A·LMTD — เปรียบเทียบพื้นที่แลกเปลี่ยนความร้อนที่ต้องการระหว่าง
        Counterflow และ Parallel Flow
      </p>

      <WarningBanner>
        ⚠️ ใช้วิธี LMTD พื้นฐานสำหรับ 1 pass เท่านั้น ยังไม่รวม correction factor F
        สำหรับ shell-and-tube หลาย pass หรือ crossflow และไม่ตรวจสอบ pressure
        drop/fouling factor กรุณาให้วิศวกรที่มีใบอนุญาตตรวจสอบก่อนใช้งานจริง
      </WarningBanner>

      <div className="mt-8 grid grid-cols-1 items-start gap-8 lg:grid-cols-[380px_1fr]">
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-medium text-slate-900">รูปแบบการไหล</h2>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-slate-700">Flow Arrangement</span>
            <select
              className="rounded-md border border-slate-300 px-3 py-2 text-slate-900"
              value={input.flowArrangement}
              onChange={(e) =>
                update("flowArrangement", e.target.value as FlowArrangement)
              }
            >
              <option value="counterflow">Counterflow (ไหลสวนทาง)</option>
              <option value="parallel">Parallel Flow (ไหลทางเดียวกัน)</option>
            </select>
          </label>

          <h2 className="pt-2 font-medium text-slate-900">อุณหภูมิของไหลร้อน</h2>
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label="เข้า (Th,in)"
              unit="°C"
              value={input.thInC}
              onChange={(v) => update("thInC", v)}
            />
            <NumberField
              label="ออก (Th,out)"
              unit="°C"
              value={input.thOutC}
              onChange={(v) => update("thOutC", v)}
            />
          </div>

          <h2 className="pt-2 font-medium text-slate-900">อุณหภูมิของไหลเย็น</h2>
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label="เข้า (Tc,in)"
              unit="°C"
              value={input.tcInC}
              onChange={(v) => update("tcInC", v)}
            />
            <NumberField
              label="ออก (Tc,out)"
              unit="°C"
              value={input.tcOutC}
              onChange={(v) => update("tcOutC", v)}
            />
          </div>

          <h2 className="pt-2 font-medium text-slate-900">ภาระความร้อนและ U</h2>
          <NumberField
            label="ภาระความร้อน (Q)"
            unit="kW"
            value={input.heatDutyKw}
            onChange={(v) => update("heatDutyKw", v)}
          />

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-slate-700">
              Overall Heat Transfer Coefficient (U)
            </span>
            <select
              className="rounded-md border border-slate-300 px-3 py-2 text-slate-900"
              value={uPresetKey}
              onChange={(e) => onUPresetChange(e.target.value)}
            >
              {U_VALUE_PRESETS.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>
          <NumberField
            label="ค่า U"
            unit="W/m²K"
            value={input.overallUWm2k}
            onChange={(v) => {
              setUPresetKey("custom");
              update("overallUWm2k", v);
            }}
          />
        </div>

        <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
          {!result.isThermodynamicallyValid ? (
            <div className="rounded-xl border border-red-300 bg-red-50 p-5">
              <div className="text-sm text-red-800">
                ⚠️ อุณหภูมิที่กรอกไม่สอดคล้องกันทางเทอร์โมไดนามิกส์
              </div>
              <div className="mt-1 text-xs text-red-800">
                ตรวจสอบว่า: ของเหลวร้อนต้องเย็นลง (Th,in &gt; Th,out), ของเหลวเย็นต้องอุ่นขึ้น
                (Tc,out &gt; Tc,in) และของเหลวร้อนต้องร้อนกว่าของเหลวเย็นตลอดทั้งเครื่อง
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-5">
              <div className="text-sm text-emerald-800">พื้นที่แลกเปลี่ยนความร้อนที่ต้องการ</div>
              <div className="text-2xl font-semibold text-emerald-900">
                {fmt(result.requiredAreaM2)} m²
              </div>
              <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-emerald-900 sm:grid-cols-3">
                <div>ΔT1 = {fmt(result.deltaT1)} °C</div>
                <div>ΔT2 = {fmt(result.deltaT2)} °C</div>
                <div>LMTD = {fmt(result.lmtdC)} °C</div>
              </div>
            </div>
          )}

          <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">
            <h3 className="mb-2 font-medium text-slate-900">สูตรที่ใช้</h3>
            <p className="font-mono text-xs text-slate-500">
              Counterflow: ΔT1 = Th,in−Tc,out, ΔT2 = Th,out−Tc,in
              <br />
              Parallel: ΔT1 = Th,in−Tc,in, ΔT2 = Th,out−Tc,out
              <br />
              LMTD = (ΔT1−ΔT2) / ln(ΔT1/ΔT2)
              <br />
              A = Q / (U × LMTD)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
