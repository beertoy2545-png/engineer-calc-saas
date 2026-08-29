"use client";

import { useMemo, useState } from "react";
import {
  SURFACE_FINISH_COEFFICIENTS,
  calculateEnduranceLimit,
  calculateGoodmanSafetyFactor,
  type LoadType,
  type SurfaceFinish,
} from "@/lib/calculations/fatigueAnalysis";
import { NumberField } from "@/components/ui/NumberField";
import { WarningBanner } from "@/components/ui/WarningBanner";
import { fmt } from "@/lib/format";

const LOAD_TYPE_LABEL: Record<LoadType, string> = {
  bending: "ดัด (Bending)",
  axial: "แนวแกน (Axial)",
  torsion: "บิด (Torsion)",
};

export default function FatigueAnalysisCalculator() {
  const [sutMpa, setSutMpa] = useState(600);
  const [loadType, setLoadType] = useState<LoadType>("bending");
  const [surfaceFinish, setSurfaceFinish] = useState<SurfaceFinish>("machined");
  const [customKa, setCustomKa] = useState(0.9);
  const [diameterMm, setDiameterMm] = useState(25);

  const enduranceResult = useMemo(
    () =>
      calculateEnduranceLimit({
        sutMpa,
        loadType,
        surfaceFinish,
        customKa,
        diameterMm,
      }),
    [sutMpa, loadType, surfaceFinish, customKa, diameterMm],
  );

  const [alternatingStressMpa, setAlternatingStressMpa] = useState(150);
  const [meanStressMpa, setMeanStressMpa] = useState(100);
  const [useEstimatedSe, setUseEstimatedSe] = useState(true);
  const [manualSeMpa, setManualSeMpa] = useState(300);

  const enduranceLimitForGoodman = useEstimatedSe
    ? enduranceResult.correctedEnduranceLimitMpa
    : manualSeMpa;

  const goodmanResult = useMemo(
    () =>
      calculateGoodmanSafetyFactor({
        alternatingStressMpa,
        meanStressMpa,
        enduranceLimitMpa: enduranceLimitForGoodman,
        ultimateTensileMpa: sutMpa,
      }),
    [alternatingStressMpa, meanStressMpa, enduranceLimitForGoodman, sutMpa],
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-slate-900">
        การวิเคราะห์ความล้า (Fatigue Analysis — Modified Goodman)
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        ประมาณค่า Endurance Limit ที่แก้ไขแล้ว (Marin Equation) และตรวจสอบ Safety Factor
        ด้วยเกณฑ์ Modified Goodman
      </p>

      <WarningBanner>
        ⚠️ ตาราง Surface Factor (ka) รองรับเฉพาะ Machined และ As-Forged ที่ตรวจสอบตัวเลขแล้ว
        เท่านั้น (แหล่งอื่นมีตัวเลขไม่สอดคล้องกันจึงไม่นำมาใส่) หากพื้นผิวอื่นให้เลือก &quot;กำหนดเอง&quot;
        และกรอกค่า ka จากตำรา/มาตรฐานที่เชื่อถือได้ ไม่รวมผล Stress Concentration (Kf) —
        กรุณาให้วิศวกรที่มีใบอนุญาตตรวจสอบก่อนใช้งานจริง
      </WarningBanner>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Endurance limit estimation */}
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-medium text-slate-900">
            ประมาณ Endurance Limit (Marin Equation)
          </h2>
          <NumberField
            label="Sut (กำลังดึงสูงสุด)"
            unit="MPa"
            value={sutMpa}
            onChange={setSutMpa}
          />

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-slate-700">ประเภทโหลด</span>
            <select
              className="rounded-md border border-slate-300 px-3 py-2 text-slate-900"
              value={loadType}
              onChange={(e) => setLoadType(e.target.value as LoadType)}
            >
              {(Object.keys(LOAD_TYPE_LABEL) as LoadType[]).map((key) => (
                <option key={key} value={key}>
                  {LOAD_TYPE_LABEL[key]}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-slate-700">ผิวสำเร็จ (Surface Finish)</span>
            <select
              className="rounded-md border border-slate-300 px-3 py-2 text-slate-900"
              value={surfaceFinish}
              onChange={(e) => setSurfaceFinish(e.target.value as SurfaceFinish)}
            >
              {Object.entries(SURFACE_FINISH_COEFFICIENTS).map(([key, v]) => (
                <option key={key} value={key}>
                  {v.label}
                </option>
              ))}
              <option value="custom">กำหนดเอง (Custom ka)</option>
            </select>
          </label>
          {surfaceFinish === "custom" && (
            <NumberField
              label="ka (กำหนดเอง)"
              value={customKa}
              step={0.01}
              onChange={setCustomKa}
            />
          )}

          <NumberField
            label="เส้นผ่านศูนย์กลาง (d)"
            unit="mm"
            value={diameterMm}
            onChange={setDiameterMm}
          />
          <p className="text-xs text-slate-400">
            * สูตร kb ใช้ได้กับช่วง 2.79-51mm (นอกช่วงนี้ใช้ kb=1 โดยประมาณ)
          </p>

          <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-4">
            <div className="text-sm text-emerald-800">Corrected Endurance Limit (Se)</div>
            <div className="text-2xl font-semibold text-emerald-900">
              {fmt(enduranceResult.correctedEnduranceLimitMpa, 1)} MPa
            </div>
            <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-emerald-800 sm:grid-cols-4">
              <div>Se&apos; = {fmt(enduranceResult.baseEnduranceLimitMpa, 1)}</div>
              <div>ka = {fmt(enduranceResult.ka, 3)}</div>
              <div>kb = {fmt(enduranceResult.kb, 3)}</div>
              <div>kc = {fmt(enduranceResult.kc, 2)}</div>
            </div>
          </div>
        </div>

        {/* Goodman diagram safety factor */}
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-medium text-slate-900">
            Safety Factor (Modified Goodman)
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label="ความเค้นสลับ (σa)"
              unit="MPa"
              value={alternatingStressMpa}
              onChange={setAlternatingStressMpa}
            />
            <NumberField
              label="ความเค้นเฉลี่ย (σm)"
              unit="MPa"
              value={meanStressMpa}
              onChange={setMeanStressMpa}
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={useEstimatedSe}
              onChange={(e) => setUseEstimatedSe(e.target.checked)}
            />
            ใช้ค่า Se ที่ประมาณไว้ด้านซ้าย ({fmt(enduranceResult.correctedEnduranceLimitMpa, 1)}{" "}
            MPa)
          </label>
          {!useEstimatedSe && (
            <NumberField
              label="Se (กำหนดเอง)"
              unit="MPa"
              value={manualSeMpa}
              onChange={setManualSeMpa}
            />
          )}

          <div
            className={`rounded-lg border p-4 ${
              goodmanResult.isInfiniteLife
                ? "border-emerald-300 bg-emerald-50"
                : "border-red-300 bg-red-50"
            }`}
          >
            <div
              className={
                goodmanResult.isInfiniteLife ? "text-sm text-emerald-800" : "text-sm text-red-800"
              }
            >
              Safety Factor (Ns)
            </div>
            <div
              className={`text-2xl font-semibold ${
                goodmanResult.isInfiniteLife ? "text-emerald-900" : "text-red-900"
              }`}
            >
              {fmt(goodmanResult.safetyFactor, 2)}
            </div>
            <div className="mt-1 text-xs">
              {goodmanResult.isInfiniteLife
                ? "✓ Ns ≥ 1 — คาดว่าอายุใช้งานไม่จำกัด (Infinite Life)"
                : "⚠️ Ns < 1 — จุดทำงานอยู่นอกเส้น Goodman ต้องลดความเค้นหรือเพิ่มขนาดชิ้นงาน"}
            </div>
          </div>

          <div className="rounded-md bg-slate-50 p-3 text-xs text-slate-500">
            1/Ns = σa/Se + σm/Sut = {fmt(goodmanResult.goodmanUtilization, 4)}
          </div>
        </div>
      </div>
    </div>
  );
}
