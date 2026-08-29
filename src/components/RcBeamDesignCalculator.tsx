"use client";

import { useMemo, useState } from "react";
import {
  calculateRcBeamDesign,
  type RcBeamInput,
} from "@/lib/calculations/rcBeamDesign";
import { NumberField } from "@/components/ui/NumberField";
import { WarningBanner } from "@/components/ui/WarningBanner";
import { fmt } from "@/lib/format";

const DEFAULT_INPUT: RcBeamInput = {
  widthMm: 300,
  effectiveDepthMm: 450,
  fckMpa: 25,
  fyMpa: 400,
  barDiameterMm: 25,
  barCount: 3,
  designMomentKnm: 200,
};

const CONTROL_CASE_LABEL: Record<string, string> = {
  tensionControlled: "Tension-Controlled (φ=0.90)",
  transition: "Transition Zone",
  compressionControlled: "Compression-Controlled (φ=0.65) — ควรเพิ่มขนาดหน้าตัดหรือลดเหล็ก",
};

export default function RcBeamDesignCalculator() {
  const [input, setInput] = useState<RcBeamInput>(DEFAULT_INPUT);
  const result = useMemo(() => calculateRcBeamDesign(input), [input]);

  const update = <K extends keyof RcBeamInput>(key: K, value: RcBeamInput[K]) =>
    setInput((prev) => ({ ...prev, [key]: value }));

  const allOk = result.isAdequate && result.isAboveMinReinforcement;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-slate-900">
        ออกแบบคานคอนกรีตเสริมเหล็ก (RC Beam Flexural Design)
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Whitney Equivalent Rectangular Stress Block (ACI 318) — คานหน้าตัดสี่เหลี่ยม
        เสริมเหล็กรับแรงดึงด้านเดียว (Singly Reinforced)
      </p>

      <WarningBanner>
        ⚠️ ตรวจสอบเฉพาะกำลังรับโมเมนต์ดัด (Flexure) เท่านั้น ยังไม่รวมการตรวจสอบแรงเฉือน
        (Shear), การแอ่นตัว (Deflection/Serviceability), ระยะฝังยึดเหล็ก (Development
        Length) หรือรายละเอียดเหล็กปลอก กรุณาให้วิศวกรโครงสร้างที่มีใบอนุญาตตรวจสอบและ
        เซ็นรับรองก่อนก่อสร้างจริง
      </WarningBanner>

      <div className="mt-8 grid grid-cols-1 items-start gap-8 lg:grid-cols-[380px_1fr]">
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-medium text-slate-900">หน้าตัดคาน</h2>
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label="ความกว้าง (b)"
              unit="mm"
              value={input.widthMm}
              onChange={(v) => update("widthMm", v)}
            />
            <NumberField
              label="ความลึกประสิทธิผล (d)"
              unit="mm"
              value={input.effectiveDepthMm}
              onChange={(v) => update("effectiveDepthMm", v)}
            />
          </div>

          <h2 className="pt-2 font-medium text-slate-900">วัสดุ</h2>
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label="f'c (กำลังอัดคอนกรีต)"
              unit="MPa"
              value={input.fckMpa}
              onChange={(v) => update("fckMpa", v)}
            />
            <NumberField
              label="fy (กำลังครากเหล็ก)"
              unit="MPa"
              value={input.fyMpa}
              onChange={(v) => update("fyMpa", v)}
            />
          </div>

          <h2 className="pt-2 font-medium text-slate-900">เหล็กเสริม</h2>
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label="ขนาดเหล็ก (⌀)"
              unit="mm"
              value={input.barDiameterMm}
              onChange={(v) => update("barDiameterMm", v)}
            />
            <NumberField
              label="จำนวนเส้น"
              value={input.barCount}
              onChange={(v) => update("barCount", v)}
            />
          </div>
          <p className="text-xs text-slate-400">
            As = {fmt(result.asMm2, 1)} mm² ({input.barCount}-D{input.barDiameterMm})
          </p>

          <h2 className="pt-2 font-medium text-slate-900">โมเมนต์ออกแบบ</h2>
          <NumberField
            label="Mu (โมเมนต์ที่ต้องรับ)"
            unit="kN·m"
            value={input.designMomentKnm}
            onChange={(v) => update("designMomentKnm", v)}
          />
        </div>

        <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
          <div
            className={`rounded-xl border p-5 ${
              allOk ? "border-emerald-300 bg-emerald-50" : "border-red-300 bg-red-50"
            }`}
          >
            <div className={allOk ? "text-sm text-emerald-800" : "text-sm text-red-800"}>
              φMn (กำลังรับโมเมนต์ที่ออกแบบได้)
            </div>
            <div
              className={`text-2xl font-semibold ${
                allOk ? "text-emerald-900" : "text-red-900"
              }`}
            >
              {fmt(result.designMomentCapacityKnm)} kN·m
            </div>

            <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-3">
              <div>a = {fmt(result.aMm)} mm</div>
              <div>c = {fmt(result.cMm)} mm</div>
              <div>εt = {fmt(result.epsilonT, 5)}</div>
              <div>Mn = {fmt(result.nominalMomentKnm)} kN·m</div>
              <div>φ = {fmt(result.phi, 2)}</div>
              <div>β1 = {fmt(result.beta1, 3)}</div>
            </div>

            <div className="mt-3 space-y-1 text-xs">
              <div
                className={
                  result.isAdequate ? "text-emerald-800" : "text-red-800 font-medium"
                }
              >
                {result.isAdequate ? "✓" : "⚠️"} φMn ({fmt(result.designMomentCapacityKnm)}) vs
                Mu ({fmt(input.designMomentKnm)}) kN·m
              </div>
              <div
                className={
                  result.isAboveMinReinforcement
                    ? "text-emerald-800"
                    : "text-red-800 font-medium"
                }
              >
                {result.isAboveMinReinforcement ? "✓" : "⚠️"} ρ ({fmt(result.rho, 5)}) vs
                ρmin ({fmt(result.rhoMin, 5)})
              </div>
              <div className="text-slate-600">
                สถานะหน้าตัด: {CONTROL_CASE_LABEL[result.controlCase]}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">
            <h3 className="mb-2 font-medium text-slate-900">สูตรที่ใช้</h3>
            <p className="font-mono text-xs text-slate-500">
              a = As·fy / (0.85·f&apos;c·b)
              <br />
              c = a / β1, εt = 0.003·(d−c)/c
              <br />
              Mn = As·fy·(d − a/2)
              <br />
              ρmin = max(0.25·√f&apos;c/fy, 1.4/fy)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
