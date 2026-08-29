"use client";

import { useMemo, useState } from "react";
import {
  HRT_RANGE_HOURS,
  MAX_WEIR_LOADING_M3_DAY_PER_M,
  SOR_CRITERIA,
  calculateClarifierDesign,
  type ClarifierInput,
  type ClarifierType,
  type TankShape,
} from "@/lib/calculations/clarifierDesign";
import { NumberField } from "@/components/ui/NumberField";
import { WarningBanner } from "@/components/ui/WarningBanner";
import { fmt } from "@/lib/format";

const DEFAULT_INPUT: ClarifierInput = {
  clarifierType: "secondary",
  avgFlowM3Day: 5000,
  peakingFactor: 2.5,
  shape: "circular",
  diameterM: 12,
  depthM: 4,
};

function CheckRow({ label, ok, detail }: { label: string; ok: boolean; detail: string }) {
  return (
    <div className={`text-sm ${ok ? "text-emerald-800" : "text-red-800 font-medium"}`}>
      {ok ? "✓" : "⚠️"} {label}: {detail}
    </div>
  );
}

export default function ClarifierDesignCalculator() {
  const [input, setInput] = useState<ClarifierInput>(DEFAULT_INPUT);
  const result = useMemo(() => calculateClarifierDesign(input), [input]);
  const criteria = SOR_CRITERIA[input.clarifierType];

  const update = <K extends keyof ClarifierInput>(key: K, value: ClarifierInput[K]) =>
    setInput((prev) => ({ ...prev, [key]: value }));

  const allOk =
    result.isSorInRange &&
    result.isPeakSorOk &&
    result.isHrtInRange &&
    result.isWeirLoadingOk;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-slate-900">
        ออกแบบถังตกตะกอน (Clarifier / Sedimentation Tank Sizing)
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        ตรวจสอบขนาดถังตกตะกอนน้ำเสีย (Primary/Secondary Clarifier) เทียบกับเกณฑ์ออกแบบ
        มาตรฐาน (Metcalf &amp; Eddy) — SOR, HRT, Weir Loading Rate
      </p>

      <WarningBanner>
        ⚠️ ตรวจสอบเทียบกับเกณฑ์ SOR/HRT/Weir Loading ทั่วไปเท่านั้น ยังไม่รวมการวิเคราะห์
        Solids Flux, ลักษณะตะกอน (floc characteristics), หรือ storm peak factor แบบละเอียด
        กรุณาให้วิศวกรสิ่งแวดล้อมที่มีใบอนุญาตตรวจสอบก่อนออกแบบจริง
      </WarningBanner>

      <div className="mt-8 grid grid-cols-1 items-start gap-8 lg:grid-cols-[380px_1fr]">
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-medium text-slate-900">เงื่อนไขการไหล</h2>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-slate-700">ประเภทถัง</span>
            <select
              className="rounded-md border border-slate-300 px-3 py-2 text-slate-900"
              value={input.clarifierType}
              onChange={(e) => update("clarifierType", e.target.value as ClarifierType)}
            >
              <option value="primary">Primary Clarifier</option>
              <option value="secondary">Secondary Clarifier (Activated Sludge)</option>
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label="อัตราการไหลเฉลี่ย (Q)"
              unit="m³/day"
              value={input.avgFlowM3Day}
              onChange={(v) => update("avgFlowM3Day", v)}
            />
            <NumberField
              label="Peaking Factor"
              value={input.peakingFactor}
              step={0.1}
              onChange={(v) => update("peakingFactor", v)}
            />
          </div>

          <h2 className="pt-2 font-medium text-slate-900">รูปทรงถัง</h2>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-slate-700">รูปทรง</span>
            <select
              className="rounded-md border border-slate-300 px-3 py-2 text-slate-900"
              value={input.shape}
              onChange={(e) => update("shape", e.target.value as TankShape)}
            >
              <option value="circular">วงกลม (Circular)</option>
              <option value="rectangular">สี่เหลี่ยม (Rectangular)</option>
            </select>
          </label>

          {input.shape === "circular" ? (
            <NumberField
              label="เส้นผ่านศูนย์กลาง (D)"
              unit="m"
              value={input.diameterM ?? 0}
              onChange={(v) => update("diameterM", v)}
            />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <NumberField
                label="ความยาว (L)"
                unit="m"
                value={input.lengthM ?? 0}
                onChange={(v) => update("lengthM", v)}
              />
              <NumberField
                label="ความกว้าง (W)"
                unit="m"
                value={input.widthM ?? 0}
                onChange={(v) => update("widthM", v)}
              />
            </div>
          )}
          <NumberField
            label="ความลึกน้ำ (Depth)"
            unit="m"
            value={input.depthM}
            onChange={(v) => update("depthM", v)}
          />

          <div className="rounded-md bg-slate-50 p-3 text-xs text-slate-500">
            พื้นที่แนะนำสำหรับ Q นี้: {fmt(result.recommendedAreaMinM2, 0)} –{" "}
            {fmt(result.recommendedAreaMaxM2, 0)} m² (SOR {criteria.minM3M2Day}–
            {criteria.maxM3M2Day} m³/m²·day)
          </div>
        </div>

        <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
          <div
            className={`rounded-xl border p-5 ${
              allOk ? "border-emerald-300 bg-emerald-50" : "border-red-300 bg-red-50"
            }`}
          >
            <div className={allOk ? "text-sm text-emerald-800" : "text-sm text-red-800"}>
              ผลการตรวจสอบ
            </div>
            <div
              className={`text-2xl font-semibold ${
                allOk ? "text-emerald-900" : "text-red-900"
              }`}
            >
              {allOk ? "ผ่านเกณฑ์ทั้งหมด ✓" : "ไม่ผ่านบางเกณฑ์ ⚠️"}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-4">
              <div>A = {fmt(result.areaM2)} m²</div>
              <div>V = {fmt(result.volumeM3, 0)} m³</div>
              <div>Weir L = {fmt(result.weirLengthM)} m</div>
              <div>SOR = {fmt(result.sorM3M2Day)} m³/m²·day</div>
            </div>

            <div className="mt-3 space-y-1">
              <CheckRow
                label="SOR"
                ok={result.isSorInRange}
                detail={`${fmt(result.sorM3M2Day)} (เกณฑ์ ${criteria.minM3M2Day}-${criteria.maxM3M2Day} m³/m²·day)`}
              />
              <CheckRow
                label="Peak SOR"
                ok={result.isPeakSorOk}
                detail={`${fmt(result.peakSorM3M2Day)} (เกณฑ์ ≤${criteria.peakMaxM3M2Day} m³/m²·day)`}
              />
              <CheckRow
                label="HRT"
                ok={result.isHrtInRange}
                detail={`${fmt(result.hrtHours)} hr (เกณฑ์ ${HRT_RANGE_HOURS.min}-${HRT_RANGE_HOURS.max} hr)`}
              />
              <CheckRow
                label="Weir Loading"
                ok={result.isWeirLoadingOk}
                detail={`${fmt(result.weirLoadingM3DayPerM, 0)} (เกณฑ์ ≤${MAX_WEIR_LOADING_M3_DAY_PER_M} m³/day/m)`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
