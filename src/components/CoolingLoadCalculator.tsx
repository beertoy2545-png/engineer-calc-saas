"use client";

import { useMemo, useState } from "react";
import {
  calculateCoolingLoad,
  type CoolingLoadInput,
  type GlazingType,
} from "@/lib/calculations/coolingLoad";

const GLAZING_LABEL: Record<GlazingType, string> = {
  single: "กระจกชั้นเดียว",
  double: "กระจกสองชั้น",
  lowE: "กระจก Low-E",
};

const DEFAULT_INPUT: CoolingLoadInput = {
  areaM2: 30,
  ceilingHeightM: 2.7,
  occupants: 4,
  lightingWattsPerM2: 12,
  equipmentWatts: 500,
  windowAreaM2: 6,
  glazingType: "single",
  outdoorTempC: 35,
  indoorTempC: 25,
  safetyFactorPct: 10,
};

function NumberField({
  label,
  unit,
  value,
  onChange,
  step = 1,
  min = 0,
}: {
  label: string;
  unit: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-slate-700">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="number"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-500 focus:outline-none"
          value={value}
          step={step}
          min={min}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        <span className="w-16 shrink-0 text-slate-500">{unit}</span>
      </div>
    </label>
  );
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-slate-100 py-1.5 text-sm">
      <span className="text-slate-600">{label}</span>
      <span className="font-medium text-slate-900">{value}</span>
    </div>
  );
}

export default function CoolingLoadCalculator() {
  const [input, setInput] = useState<CoolingLoadInput>(DEFAULT_INPUT);

  const result = useMemo(() => calculateCoolingLoad(input), [input]);

  const update = <K extends keyof CoolingLoadInput>(
    key: K,
    value: CoolingLoadInput[K],
  ) => setInput((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-slate-900">
        คำนวณภาระความเย็นเบื้องต้น (Cooling Load)
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        ใช้สำหรับประมาณขนาดเครื่องปรับอากาศเบื้องต้นในห้องเดียว วิธีคำนวณแบบ
        rule-of-thumb
      </p>

      <div className="mt-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        ⚠️ นี่คือผลการประมาณการเบื้องต้นเท่านั้น ไม่ใช่การคำนวณที่ผ่านการรับรองทางวิศวกรรม
        ก่อนนำไปใช้ออกแบบหรือติดตั้งจริง กรุณาให้วิศวกรที่มีใบอนุญาตตรวจสอบผลลัพธ์อีกครั้ง
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-medium text-slate-900">ข้อมูลห้อง</h2>
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label="พื้นที่ห้อง"
              unit="m²"
              value={input.areaM2}
              onChange={(v) => update("areaM2", v)}
            />
            <NumberField
              label="ความสูงเพดาน"
              unit="m"
              value={input.ceilingHeightM}
              onChange={(v) => update("ceilingHeightM", v)}
              step={0.1}
            />
            <NumberField
              label="จำนวนคนในห้อง"
              unit="คน"
              value={input.occupants}
              onChange={(v) => update("occupants", v)}
            />
            <NumberField
              label="พื้นที่กระจก/หน้าต่าง"
              unit="m²"
              value={input.windowAreaM2}
              onChange={(v) => update("windowAreaM2", v)}
            />
          </div>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-slate-700">ประเภทกระจก</span>
            <select
              className="rounded-md border border-slate-300 px-3 py-2 text-slate-900"
              value={input.glazingType}
              onChange={(e) =>
                update("glazingType", e.target.value as GlazingType)
              }
            >
              {(Object.keys(GLAZING_LABEL) as GlazingType[]).map((key) => (
                <option key={key} value={key}>
                  {GLAZING_LABEL[key]}
                </option>
              ))}
            </select>
          </label>

          <h2 className="pt-2 font-medium text-slate-900">โหลดภายใน</h2>
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label="โหลดไฟส่องสว่าง"
              unit="W/m²"
              value={input.lightingWattsPerM2}
              onChange={(v) => update("lightingWattsPerM2", v)}
            />
            <NumberField
              label="โหลดอุปกรณ์ไฟฟ้า"
              unit="W"
              value={input.equipmentWatts}
              onChange={(v) => update("equipmentWatts", v)}
            />
          </div>

          <h2 className="pt-2 font-medium text-slate-900">อุณหภูมิออกแบบ</h2>
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label="อุณหภูมิภายนอก"
              unit="°C"
              value={input.outdoorTempC}
              onChange={(v) => update("outdoorTempC", v)}
            />
            <NumberField
              label="อุณหภูมิภายในที่ต้องการ"
              unit="°C"
              value={input.indoorTempC}
              onChange={(v) => update("indoorTempC", v)}
            />
          </div>

          <NumberField
            label="Safety Factor"
            unit="%"
            value={input.safetyFactorPct}
            onChange={(v) => update("safetyFactorPct", v)}
          />
        </div>

        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-medium text-slate-900">ผลลัพธ์</h2>

          <div className="rounded-lg bg-slate-50 p-4">
            <ResultRow
              label="โหลดจากคน"
              value={`${result.peopleLoadBtuH.toFixed(0)} BTU/hr`}
            />
            <ResultRow
              label="โหลดจากไฟส่องสว่าง"
              value={`${result.lightingLoadBtuH.toFixed(0)} BTU/hr`}
            />
            <ResultRow
              label="โหลดจากอุปกรณ์ไฟฟ้า"
              value={`${result.equipmentLoadBtuH.toFixed(0)} BTU/hr`}
            />
            <ResultRow
              label="โหลดผ่านผนัง/หลังคา"
              value={`${result.envelopeLoadBtuH.toFixed(0)} BTU/hr`}
            />
            <ResultRow
              label="โหลดจากแสงแดดผ่านกระจก"
              value={`${result.solarLoadBtuH.toFixed(0)} BTU/hr`}
            />
          </div>

          <div className="rounded-lg border border-slate-900/10 bg-slate-900 p-4 text-white">
            <ResultRowDark
              label="รวมก่อน Safety Factor"
              value={`${result.subtotalBtuH.toFixed(0)} BTU/hr`}
            />
            <ResultRowDark
              label={`รวมทั้งหมด (+${input.safetyFactorPct}%)`}
              value={`${result.totalWithSafetyBtuH.toFixed(0)} BTU/hr`}
            />
            <ResultRowDark
              label="เทียบเท่า"
              value={`${result.totalTons.toFixed(2)} Ton (${result.totalKw.toFixed(2)} kW)`}
            />
          </div>

          <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-4 text-center">
            <div className="text-sm text-emerald-800">
              ขนาดเครื่องปรับอากาศที่แนะนำ
            </div>
            <div className="text-2xl font-semibold text-emerald-900">
              {result.recommendedBtuSize.toLocaleString()} BTU/hr
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResultRowDark({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-white/10 py-1.5 text-sm">
      <span className="text-slate-300">{label}</span>
      <span className="font-medium text-white">{value}</span>
    </div>
  );
}
