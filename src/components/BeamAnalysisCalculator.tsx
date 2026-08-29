"use client";

import { useMemo, useState } from "react";
import {
  calculateBeamAnalysis,
  type BeamAnalysisInput,
  type CrossSectionType,
  type LoadType,
  type SupportType,
} from "@/lib/calculations/beamAnalysis";
import { NumberField } from "@/components/ui/NumberField";
import { WarningBanner } from "@/components/ui/WarningBanner";
import { fmt } from "@/lib/format";
import BeamDiagram from "@/components/BeamDiagram";

const DEFAULT_INPUT: BeamAnalysisInput = {
  supportType: "simplySupported",
  loadType: "point",
  pointLoadKn: 10,
  udlKnPerM: 5,
  spanM: 4,
  elasticModulusGpa: 200,
  crossSection: { type: "rectangular", widthMm: 100, heightMm: 200 },
  yieldStrengthMpa: 250,
  safetyFactor: 1.67,
  deflectionLimitDenominator: 360,
};

const SUPPORT_LABEL: Record<SupportType, string> = {
  simplySupported: "คานช่วงเดียว (Simply Supported)",
  cantilever: "คานยื่น (Cantilever)",
};

export default function BeamAnalysisCalculator() {
  const [input, setInput] = useState<BeamAnalysisInput>(DEFAULT_INPUT);
  const result = useMemo(() => calculateBeamAnalysis(input), [input]);

  const update = <K extends keyof BeamAnalysisInput>(
    key: K,
    value: BeamAnalysisInput[K],
  ) => setInput((prev) => ({ ...prev, [key]: value }));

  const updateSection = (patch: Partial<BeamAnalysisInput["crossSection"]>) =>
    setInput((prev) => ({
      ...prev,
      crossSection: { ...prev.crossSection, ...patch },
    }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-slate-900">
        คำนวณคาน (Beam Bending Stress &amp; Deflection)
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Euler-Bernoulli beam theory — คานช่วงเดียว/คานยื่น รับโหลดจุดกึ่งกลาง/ปลาย
        หรือโหลดแผ่สม่ำเสมอ (UDL)
      </p>

      <WarningBanner>
        ⚠️ ครอบคลุมเฉพาะ 4 กรณีมาตรฐาน (จุดรองรับ × ประเภทโหลด) เท่านั้น ไม่รวมโหลดผสม
        หลายช่วง หรือตำแหน่งโหลดนอกกึ่งกลาง กรุณาให้วิศวกรโครงสร้างที่มีใบอนุญาตตรวจสอบและ
        เซ็นรับรองก่อนก่อสร้างจริง
      </WarningBanner>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 font-medium text-slate-900">แผนภาพคาน (Beam Diagram)</h2>
        <BeamDiagram input={input} />
      </div>

      <div className="mt-8 grid grid-cols-1 items-start gap-8 lg:grid-cols-[380px_1fr]">
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-medium text-slate-900">รูปแบบคานและโหลด</h2>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-slate-700">จุดรองรับ</span>
            <select
              className="rounded-md border border-slate-300 px-3 py-2 text-slate-900"
              value={input.supportType}
              onChange={(e) => update("supportType", e.target.value as SupportType)}
            >
              {(Object.keys(SUPPORT_LABEL) as SupportType[]).map((key) => (
                <option key={key} value={key}>
                  {SUPPORT_LABEL[key]}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-slate-700">ประเภทโหลด</span>
            <select
              className="rounded-md border border-slate-300 px-3 py-2 text-slate-900"
              value={input.loadType}
              onChange={(e) => update("loadType", e.target.value as LoadType)}
            >
              <option value="point">
                โหลดจุด (
                {input.supportType === "simplySupported" ? "กึ่งกลาง" : "ปลายยื่น"})
              </option>
              <option value="udl">โหลดแผ่สม่ำเสมอ (UDL)</option>
            </select>
          </label>

          {input.loadType === "point" ? (
            <NumberField
              label="ขนาดโหลด (P)"
              unit="kN"
              value={input.pointLoadKn}
              onChange={(v) => update("pointLoadKn", v)}
            />
          ) : (
            <NumberField
              label="โหลดแผ่ (w)"
              unit="kN/m"
              value={input.udlKnPerM}
              onChange={(v) => update("udlKnPerM", v)}
            />
          )}

          <NumberField
            label="ความยาวช่วงคาน (L)"
            unit="m"
            value={input.spanM}
            step={0.1}
            onChange={(v) => update("spanM", v)}
          />
          <NumberField
            label="Elastic Modulus (E)"
            unit="GPa"
            value={input.elasticModulusGpa}
            onChange={(v) => update("elasticModulusGpa", v)}
          />

          <h2 className="pt-2 font-medium text-slate-900">หน้าตัดคาน</h2>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-slate-700">รูปแบบหน้าตัด</span>
            <select
              className="rounded-md border border-slate-300 px-3 py-2 text-slate-900"
              value={input.crossSection.type}
              onChange={(e) =>
                updateSection({ type: e.target.value as CrossSectionType })
              }
            >
              <option value="rectangular">สี่เหลี่ยมผืนผ้า</option>
              <option value="circular">วงกลม</option>
              <option value="custom">กำหนดเอง (I, c)</option>
            </select>
          </label>

          {input.crossSection.type === "rectangular" && (
            <div className="grid grid-cols-2 gap-3">
              <NumberField
                label="ความกว้าง (b)"
                unit="mm"
                value={input.crossSection.widthMm ?? 0}
                onChange={(v) => updateSection({ widthMm: v })}
              />
              <NumberField
                label="ความสูง (h)"
                unit="mm"
                value={input.crossSection.heightMm ?? 0}
                onChange={(v) => updateSection({ heightMm: v })}
              />
            </div>
          )}
          {input.crossSection.type === "circular" && (
            <NumberField
              label="เส้นผ่านศูนย์กลาง (d)"
              unit="mm"
              value={input.crossSection.diameterMm ?? 0}
              onChange={(v) => updateSection({ diameterMm: v })}
            />
          )}
          {input.crossSection.type === "custom" && (
            <div className="grid grid-cols-2 gap-3">
              <NumberField
                label="I"
                unit="mm⁴"
                value={input.crossSection.customIMm4 ?? 0}
                onChange={(v) => updateSection({ customIMm4: v })}
              />
              <NumberField
                label="c"
                unit="mm"
                value={input.crossSection.customCMm ?? 0}
                onChange={(v) => updateSection({ customCMm: v })}
              />
            </div>
          )}

          <h2 className="pt-2 font-medium text-slate-900">เกณฑ์ตรวจสอบ</h2>
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label="Yield Strength (Sy)"
              unit="MPa"
              value={input.yieldStrengthMpa}
              onChange={(v) => update("yieldStrengthMpa", v)}
            />
            <NumberField
              label="Safety Factor"
              value={input.safetyFactor}
              step={0.1}
              onChange={(v) => update("safetyFactor", v)}
            />
          </div>
          <NumberField
            label="เกณฑ์ Deflection (L/n)"
            value={input.deflectionLimitDenominator}
            onChange={(v) => update("deflectionLimitDenominator", v)}
          />
        </div>

        <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
          <div
            className={`rounded-xl border p-5 ${
              result.stressOk && result.deflectionOk
                ? "border-emerald-300 bg-emerald-50"
                : "border-red-300 bg-red-50"
            }`}
          >
            <div
              className={
                result.stressOk && result.deflectionOk
                  ? "text-sm text-emerald-800"
                  : "text-sm text-red-800"
              }
            >
              ผลการตรวจสอบ
            </div>
            <div
              className={`text-2xl font-semibold ${
                result.stressOk && result.deflectionOk
                  ? "text-emerald-900"
                  : "text-red-900"
              }`}
            >
              {result.stressOk && result.deflectionOk ? "ผ่านเกณฑ์ ✓" : "ไม่ผ่านเกณฑ์ ⚠️"}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-4">
              <div>
                I = {fmt(result.iMm4, 0)} mm⁴
                <br />c = {fmt(result.cMm, 1)} mm
              </div>
              <div>
                Mmax = {fmt(result.maxMomentNmm / 1e6, 2)} kN·m
              </div>
              <div>
                σmax = {fmt(result.maxBendingStressMpa)} MPa
                <br />σallow = {fmt(result.allowableStressMpa)} MPa
              </div>
              <div>
                δmax = {fmt(result.maxDeflectionMm)} mm
                <br />δlimit = {fmt(result.deflectionLimitMm)} mm
              </div>
            </div>

            <div className="mt-3 space-y-1 text-xs">
              <div className={result.stressOk ? "text-emerald-800" : "text-red-800"}>
                {result.stressOk ? "✓" : "⚠️"} Bending stress:{" "}
                {fmt(result.maxBendingStressMpa)} / {fmt(result.allowableStressMpa)} MPa
              </div>
              <div className={result.deflectionOk ? "text-emerald-800" : "text-red-800"}>
                {result.deflectionOk ? "✓" : "⚠️"} Deflection:{" "}
                {fmt(result.maxDeflectionMm)} / {fmt(result.deflectionLimitMm)} mm
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
