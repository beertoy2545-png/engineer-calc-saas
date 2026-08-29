"use client";

import { useMemo, useState } from "react";
import {
  calculateJointEquilibrium,
  type JointEquilibriumInput,
} from "@/lib/calculations/biomechanics";
import { NumberField } from "@/components/ui/NumberField";
import { WarningBanner } from "@/components/ui/WarningBanner";
import { fmt } from "@/lib/format";

// Defaults match the classic OpenStax College Physics biceps/elbow example
const DEFAULT_INPUT: JointEquilibriumInput = {
  muscleMomentArmM: 0.04,
  limbComDistanceM: 0.16,
  loadDistanceM: 0.38,
  limbMassKg: 2.5,
  loadMassKg: 4.0,
  gravityMs2: 9.8,
};

export default function BiomechanicsCalculator() {
  const [input, setInput] = useState<JointEquilibriumInput>(DEFAULT_INPUT);
  const result = useMemo(() => calculateJointEquilibrium(input), [input]);

  const update = <K extends keyof JointEquilibriumInput>(
    key: K,
    value: JointEquilibriumInput[K],
  ) => setInput((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-slate-900">
        กลศาสตร์ชีวภาพ (Biomechanics — Joint Static Equilibrium)
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        วิเคราะห์แรงกล้ามเนื้อและแรงปฏิกิริยาที่ข้อต่อ ด้วยหลัก Statics (Torque &amp; Force
        Balance) — ตัวอย่างคลาสสิก: ข้อศอกและกล้ามเนื้อ Biceps
      </p>

      <WarningBanner>
        ⚠️ นี่คือแบบจำลอง Statics อย่างง่าย (คาน 1 กล้ามเนื้อ ระนาบเดียว) ใช้เพื่อการศึกษา/
        ออกแบบเบื้องต้นเท่านั้น (เช่น การออกแบบอุปกรณ์ Ergonomics, Prosthetics) —{" "}
        <strong>ไม่ใช่เครื่องมือทางคลินิก และไม่เกี่ยวข้องกับการวินิจฉัยหรือการรักษาใดๆ</strong>{" "}
        ข้อต่อจริงมีหลายกล้ามเนื้อทำงานร่วมกันและมุมข้อต่อที่เปลี่ยนแปลงตลอดเวลา
      </WarningBanner>

      <div className="mt-8 grid grid-cols-1 items-start gap-8 lg:grid-cols-[380px_1fr]">
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-medium text-slate-900">เรขาคณิตของแขน (Lever Geometry)</h2>
          <NumberField
            label="ระยะจุดเกาะกล้ามเนื้อจากข้อต่อ (r1)"
            unit="m"
            value={input.muscleMomentArmM}
            step={0.005}
            onChange={(v) => update("muscleMomentArmM", v)}
          />
          <NumberField
            label="ระยะจุดศูนย์ถ่วงแขนจากข้อต่อ (r2)"
            unit="m"
            value={input.limbComDistanceM}
            step={0.01}
            onChange={(v) => update("limbComDistanceM", v)}
          />
          <NumberField
            label="ระยะของที่ถือจากข้อต่อ (r3)"
            unit="m"
            value={input.loadDistanceM}
            step={0.01}
            onChange={(v) => update("loadDistanceM", v)}
          />

          <h2 className="pt-2 font-medium text-slate-900">น้ำหนัก</h2>
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label="มวลแขนท่อนล่าง"
              unit="kg"
              value={input.limbMassKg}
              step={0.1}
              onChange={(v) => update("limbMassKg", v)}
            />
            <NumberField
              label="มวลของที่ถือ"
              unit="kg"
              value={input.loadMassKg}
              step={0.1}
              onChange={(v) => update("loadMassKg", v)}
            />
          </div>
          <NumberField
            label="g"
            unit="m/s²"
            value={input.gravityMs2}
            step={0.01}
            onChange={(v) => update("gravityMs2", v)}
          />
        </div>

        <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
          <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-5">
            <div className="text-sm text-emerald-800">แรงกล้ามเนื้อที่ต้องการ (F_muscle)</div>
            <div className="text-2xl font-semibold text-emerald-900">
              {fmt(result.muscleForceN, 1)} N
            </div>
            <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-emerald-900 sm:grid-cols-3">
              <div>แรงปฏิกิริยาข้อต่อ = {fmt(result.jointReactionForceN, 1)} N</div>
              <div>น้ำหนักรวม = {fmt(result.totalWeightN, 1)} N</div>
              <div>ตัวคูณแรง = {fmt(result.forceMultiplier, 2)}×</div>
            </div>
            <div className="mt-2 text-xs text-emerald-800">
              Mechanical Advantage (r1/r3) = {fmt(result.mechanicalAdvantage, 4)} —
              กล้ามเนื้อต้องออกแรงมากกว่าน้ำหนักที่ถือหลายเท่า เพราะ moment arm ของกล้ามเนื้อ
              สั้นกว่าระยะของที่ถือมาก
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">
            <h3 className="mb-2 font-medium text-slate-900">สูตรที่ใช้</h3>
            <p className="font-mono text-xs text-slate-500">
              Torque balance: r1·F_muscle = r2·W_limb + r3·W_load
              <br />
              Force balance: F_joint = F_muscle − (W_limb + W_load)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
