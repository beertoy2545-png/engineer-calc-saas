"use client";

import { useMemo, useState } from "react";
import {
  MATERIAL_PRESETS,
  calculateShaftDesign,
  type ShaftDesignInput,
} from "@/lib/calculations/shaftDesign";
import { NumberField as Field } from "@/components/ui/NumberField";
import { WarningBanner } from "@/components/ui/WarningBanner";
import { fmt } from "@/lib/format";

const DEFAULT_MATERIAL_KEY = "aisi1040";

const DEFAULT_INPUT: ShaftDesignInput = {
  powerKw: 5,
  speedRpm: 1450,
  bendingMomentNm: 80,
  syMpa: 350,
  sutMpa: 520,
  hasKeyway: true,
  kb: 1.5,
  kt: 1.0,
};

export default function ShaftDesignCalculator() {
  const [materialKey, setMaterialKey] = useState(DEFAULT_MATERIAL_KEY);
  const [input, setInput] = useState<ShaftDesignInput>(DEFAULT_INPUT);

  const result = useMemo(() => calculateShaftDesign(input), [input]);

  const update = <K extends keyof ShaftDesignInput>(
    key: K,
    value: ShaftDesignInput[K],
  ) => setInput((prev) => ({ ...prev, [key]: value }));

  const onMaterialChange = (key: string) => {
    setMaterialKey(key);
    const preset = MATERIAL_PRESETS.find((m) => m.key === key);
    if (preset && key !== "custom") {
      setInput((prev) => ({ ...prev, syMpa: preset.syMpa, sutMpa: preset.sutMpa }));
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-slate-900">
        คำนวณขนาดเพลา (Shaft Design — ASME Code)
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        อ้างอิงวิธี ASME Code สำหรับออกแบบเพลา (ME310, eq. 3.4) — ใช้ Von Mises
        stress กับ shock/fatigue factor kb, kt
      </p>

      <WarningBanner>
        ⚠️ วิธีนี้ยังไม่รวมผลของ Stress Concentration (Kc, Kcs) และการวิเคราะห์
        Fatigue แบบละเอียด (Soderberg) — เหมาะสำหรับประมาณขนาดเบื้องต้นเท่านั้น
        กรุณาให้วิศวกรที่มีใบอนุญาตตรวจสอบก่อนนำไปผลิตจริง
      </WarningBanner>

      <div className="mt-8 grid grid-cols-1 items-start gap-8 lg:grid-cols-[380px_1fr]">
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-medium text-slate-900">โหลดบนเพลา</h2>
          <Field
            label="กำลังส่งผ่าน (Power)"
            unit="kW"
            value={input.powerKw}
            onChange={(v) => update("powerKw", v)}
          />
          <Field
            label="ความเร็วรอบ (Speed)"
            unit="rpm"
            value={input.speedRpm}
            onChange={(v) => update("speedRpm", v)}
          />
          <Field
            label="โมเมนต์ดัด (Bending Moment, M)"
            unit="N·m"
            value={input.bendingMomentNm}
            onChange={(v) => update("bendingMomentNm", v)}
          />
          <p className="text-xs text-slate-400">
            * M หาได้จากการวิเคราะห์แรงบนเพลา (shear-moment diagram) ที่จุดวิกฤต
          </p>

          <h2 className="pt-2 font-medium text-slate-900">วัสดุเพลา</h2>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-slate-700">เกรดวัสดุ (Table 1.7, Shigley 2003)</span>
            <select
              className="rounded-md border border-slate-300 px-3 py-2 text-slate-900"
              value={materialKey}
              onChange={(e) => onMaterialChange(e.target.value)}
            >
              {MATERIAL_PRESETS.map((m) => (
                <option key={m.key} value={m.key}>
                  {m.label}
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Sy (Yield)"
              unit="MPa"
              value={input.syMpa}
              onChange={(v) => {
                setMaterialKey("custom");
                update("syMpa", v);
              }}
            />
            <Field
              label="Sut (Ultimate)"
              unit="MPa"
              value={input.sutMpa}
              onChange={(v) => {
                setMaterialKey("custom");
                update("sutMpa", v);
              }}
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={input.hasKeyway}
              onChange={(e) => update("hasKeyway", e.target.checked)}
            />
            มีร่องลิ่ม (Keyway) — ลดค่า allowable stress 25%
          </label>

          <h2 className="pt-2 font-medium text-slate-900">
            Shock &amp; Fatigue Factor
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="kb (bending)"
              value={input.kb}
              step={0.1}
              onChange={(v) => update("kb", v)}
            />
            <Field
              label="kt (torsion)"
              value={input.kt}
              step={0.1}
              onChange={(v) => update("kt", v)}
            />
          </div>
          <div className="rounded-md bg-slate-50 p-3 text-xs text-slate-500">
            แนวทางเลือกค่า kb/kt (เพลาหมุน):
            <br />• โหลดสม่ำเสมอ: kb≈1.5, kt≈1.0
            <br />• กระแทกเล็กน้อย: kb≈1.5–2.0, kt≈1.0–1.5
            <br />• กระแทกรุนแรง: kb≈2.0–3.0, kt≈1.5–3.0
          </div>
        </div>

        <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
          <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-5">
            <div className="text-sm text-emerald-800">ขนาดเพลาที่แนะนำ</div>
            <div className="text-2xl font-semibold text-emerald-900">
              ⌀ {result.recommendedDiameterMm} mm
            </div>
            <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-emerald-900 sm:grid-cols-3">
              <div>T = {fmt(result.torqueNm)} N·m</div>
              <div>τ_allow = {fmt(result.tauAllowMpa)} MPa</div>
              <div>d (คำนวณได้) = {fmt(result.requiredDiameterMm)} mm</div>
            </div>
            <div className="mt-1 text-xs text-emerald-800">
              τ_allow ก่อนปรับ = min(0.3×Sy, 0.18×Sut) ={" "}
              {fmt(result.tauAllowMpaRaw)} MPa
              {result.keywayReduced && " · ลด 25% จาก keyway"}
              {result.cappedByCode &&
                " · ถูกจำกัดด้วยเพดานมาตรฐาน (55/41 MPa)"}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">
            <h3 className="mb-2 font-medium text-slate-900">สูตรที่ใช้</h3>
            <p className="font-mono text-xs text-slate-500">
              T = 9549.3 × P(kW) / N(rpm)
              <br />
              τ_allow = min(0.3·Sy, 0.18·Sut) [×0.75 ถ้ามี keyway]
              <br />
              d = [ 16 / (π·τ_allow) · √((kb·M)² + (kt·T)²) ] ^ (1/3)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
