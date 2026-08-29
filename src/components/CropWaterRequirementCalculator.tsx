"use client";

import { useMemo, useState } from "react";
import {
  CROP_PRESETS,
  calculateCropWaterRequirement,
  type CropWaterInput,
} from "@/lib/calculations/cropWaterRequirement";
import { NumberField } from "@/components/ui/NumberField";
import { WarningBanner } from "@/components/ui/WarningBanner";
import { fmt } from "@/lib/format";

const DEFAULT_INPUT: CropWaterInput = {
  refEtoMmDay: 5,
  cropCoefficientKc: 1.2,
  effectiveRainfallMmDay: 0,
  fieldCapacityFrac: 0.3,
  wiltingPointFrac: 0.15,
  rootDepthM: 0.6,
  managementAllowedDepletion: 0.5,
  irrigationEfficiencyPct: 75,
  fieldAreaHa: 1,
};

export default function CropWaterRequirementCalculator() {
  const [cropKey, setCropKey] = useState("corn");
  const [input, setInput] = useState<CropWaterInput>(DEFAULT_INPUT);
  const result = useMemo(() => calculateCropWaterRequirement(input), [input]);

  const update = <K extends keyof CropWaterInput>(key: K, value: CropWaterInput[K]) =>
    setInput((prev) => ({ ...prev, [key]: value }));

  const onCropChange = (key: string) => {
    setCropKey(key);
    const preset = CROP_PRESETS.find((c) => c.key === key);
    if (preset && key !== "custom") update("cropCoefficientKc", preset.kcMid);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-slate-900">
        ความต้องการน้ำของพืชและการให้น้ำ (Crop Water Requirement &amp; Irrigation
        Scheduling)
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        วิธี FAO-56 Crop Coefficient (ETc = Kc × ETo) — คำนวณรอบการให้น้ำและปริมาณน้ำที่ต้องใช้
      </p>

      <WarningBanner>
        ⚠️ ใช้ Kc ช่วง Mid-Season เท่านั้น (ไม่ปรับตามระยะการเจริญเติบโต) ไม่รวมการซึมลึก
        (Deep Percolation), Capillary Rise, หรือการจัดการน้ำขังสำหรับนาข้าว (ซึ่งต่างจาก
        การให้น้ำแบบ Depletion-Based ที่ใช้ในเครื่องมือนี้) กรุณาให้วิศวกรชลประทาน/เกษตร
        ที่มีความเชี่ยวชาญตรวจสอบก่อนออกแบบระบบจริง
      </WarningBanner>

      <div className="mt-8 grid grid-cols-1 items-start gap-8 lg:grid-cols-[380px_1fr]">
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-medium text-slate-900">สภาพอากาศและพืช</h2>
          <NumberField
            label="Reference ET (ETo)"
            unit="mm/day"
            value={input.refEtoMmDay}
            step={0.1}
            onChange={(v) => update("refEtoMmDay", v)}
          />
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-slate-700">ชนิดพืช (Kc, Mid-Season)</span>
            <select
              className="rounded-md border border-slate-300 px-3 py-2 text-slate-900"
              value={cropKey}
              onChange={(e) => onCropChange(e.target.value)}
            >
              {CROP_PRESETS.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <NumberField
            label="Kc"
            value={input.cropCoefficientKc}
            step={0.05}
            onChange={(v) => {
              setCropKey("custom");
              update("cropCoefficientKc", v);
            }}
          />
          <NumberField
            label="ฝนที่ใช้ประโยชน์ได้ (Effective Rainfall)"
            unit="mm/day"
            value={input.effectiveRainfallMmDay}
            step={0.5}
            onChange={(v) => update("effectiveRainfallMmDay", v)}
          />

          <h2 className="pt-2 font-medium text-slate-900">คุณสมบัติดิน</h2>
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label="Field Capacity (θFC)"
              value={input.fieldCapacityFrac}
              step={0.01}
              onChange={(v) => update("fieldCapacityFrac", v)}
            />
            <NumberField
              label="Wilting Point (θWP)"
              value={input.wiltingPointFrac}
              step={0.01}
              onChange={(v) => update("wiltingPointFrac", v)}
            />
          </div>
          <NumberField
            label="ความลึกราก (Zr)"
            unit="m"
            value={input.rootDepthM}
            step={0.05}
            onChange={(v) => update("rootDepthM", v)}
          />
          <NumberField
            label="Management Allowed Depletion (MAD)"
            value={input.managementAllowedDepletion}
            step={0.05}
            onChange={(v) => update("managementAllowedDepletion", v)}
          />

          <h2 className="pt-2 font-medium text-slate-900">ระบบให้น้ำ</h2>
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label="ประสิทธิภาพระบบ"
              unit="%"
              value={input.irrigationEfficiencyPct}
              onChange={(v) => update("irrigationEfficiencyPct", v)}
            />
            <NumberField
              label="พื้นที่แปลง"
              unit="ha"
              value={input.fieldAreaHa}
              step={0.1}
              onChange={(v) => update("fieldAreaHa", v)}
            />
          </div>
          <p className="text-xs text-slate-400">
            * ประสิทธิภาพทั่วไป: น้ำหยด 70-90%, สปริงเกลอร์ 60-75%
          </p>
        </div>

        <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
          <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-5">
            <div className="text-sm text-emerald-800">รอบการให้น้ำ (Irrigation Interval)</div>
            <div className="text-2xl font-semibold text-emerald-900">
              {Number.isFinite(result.irrigationIntervalDays)
                ? `ทุก ${fmt(result.irrigationIntervalDays, 1)} วัน`
                : "ไม่ต้องให้น้ำ (ฝนเพียงพอ)"}
            </div>
            <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-emerald-900 sm:grid-cols-3">
              <div>ETc = {fmt(result.etcMmDay, 2)} mm/day</div>
              <div>ความต้องการสุทธิ = {fmt(result.netIrrigationMmDay, 2)} mm/day</div>
              <div>TAW = {fmt(result.totalAvailableWaterMm, 1)} mm</div>
              <div>RAW = {fmt(result.readilyAvailableWaterMm, 1)} mm</div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm shadow-sm">
            <h3 className="mb-2 font-medium text-slate-900">ปริมาณน้ำต่อรอบการให้น้ำ</h3>
            <div className="flex justify-between border-b border-slate-100 py-1.5">
              <span className="text-slate-600">ความลึกน้ำที่ต้องให้ (Gross Depth)</span>
              <span className="font-medium text-slate-900">
                {fmt(result.grossIrrigationDepthMm, 1)} mm
              </span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-600">ปริมาตรน้ำต่อรอบ (พื้นที่ {input.fieldAreaHa} ha)</span>
              <span className="font-medium text-slate-900">
                {fmt(result.irrigationVolumeM3, 1)} m³
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
