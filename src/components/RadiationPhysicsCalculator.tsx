"use client";

import { useMemo, useState } from "react";
import {
  calculateDecay,
  calculateShielding,
  type DecayInput,
  type ShieldingInput,
} from "@/lib/calculations/radiationPhysics";
import { NumberField } from "@/components/ui/NumberField";
import { WarningBanner } from "@/components/ui/WarningBanner";
import { fmt } from "@/lib/format";

const DEFAULT_DECAY: DecayInput = {
  initialActivity: 1000,
  halfLife: 5730,
  elapsedTime: 2000,
};

const DEFAULT_SHIELDING: ShieldingInput = {
  initialIntensity: 100,
  linearAttenuationCoefficientPerCm: 0.5,
  thicknessCm: 2,
};

export default function RadiationPhysicsCalculator() {
  const [decay, setDecay] = useState<DecayInput>(DEFAULT_DECAY);
  const [shielding, setShielding] = useState<ShieldingInput>(DEFAULT_SHIELDING);

  const decayResult = useMemo(() => calculateDecay(decay), [decay]);
  const shieldingResult = useMemo(() => calculateShielding(shielding), [shielding]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-slate-900">
        ฟิสิกส์รังสี (Radiation Physics — Decay &amp; Shielding)
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        การสลายตัวของสารกัมมันตรังสี (Radioactive Decay) และการลดทอนรังสีผ่านวัสดุกำบัง
        (Shielding Attenuation)
      </p>

      <WarningBanner>
        ⚠️ ครอบคลุมเฉพาะพื้นฐานฟิสิกส์การสลายตัวและการกำบังรังสี (health physics /
        radiation safety) เท่านั้น ไม่เกี่ยวข้องกับการออกแบบเครื่องปฏิกรณ์หรือ criticality
        safety การคำนวณ Shielding จริงต้องรวม Buildup Factor และค่าสัมประสิทธิ์การลดทอนตาม
        พลังงานโฟตอนจริง งานด้านความปลอดภัยทางรังสีต้องดำเนินการโดยเจ้าหน้าที่ความปลอดภัยทาง
        รังสี (RSO) หรือวิศวกรนิวเคลียร์ที่ได้รับใบอนุญาตเท่านั้น
      </WarningBanner>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Decay */}
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-medium text-slate-900">การสลายตัวของสาร (Radioactive Decay)</h2>
          <NumberField
            label="กัมมันตภาพเริ่มต้น (A0)"
            value={decay.initialActivity}
            onChange={(v) => setDecay((p) => ({ ...p, initialActivity: v }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label="ครึ่งชีวิต (t½)"
              value={decay.halfLife}
              onChange={(v) => setDecay((p) => ({ ...p, halfLife: v }))}
            />
            <NumberField
              label="เวลาที่ผ่านไป (t)"
              value={decay.elapsedTime}
              onChange={(v) => setDecay((p) => ({ ...p, elapsedTime: v }))}
            />
          </div>
          <p className="text-xs text-slate-400">
            * t½ และ t ต้องใช้หน่วยเวลาเดียวกัน (เช่น วัน, ปี, วินาที)
          </p>

          <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-4">
            <div className="text-sm text-emerald-800">กัมมันตภาพคงเหลือ A(t)</div>
            <div className="text-2xl font-semibold text-emerald-900">
              {fmt(decayResult.remainingActivity, 2)}
            </div>
            <div className="mt-1 text-xs text-emerald-800">
              เหลือ {fmt(decayResult.fractionRemaining * 100, 2)}% · ผ่านไป{" "}
              {fmt(decayResult.numberOfHalfLives, 3)} ครึ่งชีวิต
            </div>
          </div>
        </div>

        {/* Shielding */}
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-medium text-slate-900">การกำบังรังสี (Shielding Attenuation)</h2>
          <NumberField
            label="ความเข้มเริ่มต้น (I0)"
            value={shielding.initialIntensity}
            onChange={(v) => setShielding((p) => ({ ...p, initialIntensity: v }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label="ค่าสัมประสิทธิ์การลดทอน (μ)"
              unit="1/cm"
              value={shielding.linearAttenuationCoefficientPerCm}
              step={0.01}
              onChange={(v) =>
                setShielding((p) => ({ ...p, linearAttenuationCoefficientPerCm: v }))
              }
            />
            <NumberField
              label="ความหนาวัสดุกำบัง (x)"
              unit="cm"
              value={shielding.thicknessCm}
              step={0.1}
              onChange={(v) => setShielding((p) => ({ ...p, thicknessCm: v }))}
            />
          </div>

          <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-4">
            <div className="text-sm text-emerald-800">ความเข้มที่ทะลุผ่าน I(x)</div>
            <div className="text-2xl font-semibold text-emerald-900">
              {fmt(shieldingResult.transmittedIntensity, 3)}
            </div>
            <div className="mt-1 text-xs text-emerald-800">
              ลดทอน {fmt(shieldingResult.percentAttenuated, 2)}% · HVL ={" "}
              {fmt(shieldingResult.halfValueLayerCm, 3)} cm · เทียบเท่า{" "}
              {fmt(shieldingResult.numberOfHvls, 2)} HVL
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
