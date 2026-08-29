"use client";

import { useMemo, useState } from "react";
import {
  calculateBraking,
  type BrakingInput,
} from "@/lib/calculations/vehicleDynamics";
import { NumberField } from "@/components/ui/NumberField";
import { WarningBanner } from "@/components/ui/WarningBanner";
import { fmt } from "@/lib/format";

const DEFAULT_INPUT: BrakingInput = {
  initialSpeedKmh: 100,
  reactionTimeS: 1.5,
  frictionCoefficient: 0.7,
  gravityMs2: 9.81,
  vehicleMassKg: 1500,
  cgHeightM: 0.5,
  wheelbaseM: 2.7,
  staticFrontWeightFraction: 0.5,
};

const SURFACE_PRESETS = [
  { label: "ยางมะตอยแห้ง (Dry Asphalt)", mu: 0.8 },
  { label: "คอนกรีตแห้ง (Dry Concrete)", mu: 0.75 },
  { label: "ถนนเปียก (Wet Road)", mu: 0.5 },
  { label: "หิมะอัดแน่น (Packed Snow)", mu: 0.2 },
  { label: "น้ำแข็ง (Ice)", mu: 0.1 },
];

export default function VehicleDynamicsCalculator() {
  const [input, setInput] = useState<BrakingInput>(DEFAULT_INPUT);
  const result = useMemo(() => calculateBraking(input), [input]);

  const update = <K extends keyof BrakingInput>(key: K, value: BrakingInput[K]) =>
    setInput((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-slate-900">
        พลศาสตร์ยานยนต์ (Vehicle Dynamics — Braking &amp; Weight Transfer)
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        คำนวณระยะเบรกและการถ่ายน้ำหนัก (Weight Transfer) ระหว่างเบรกกะทันหัน
      </p>

      <WarningBanner>
        ⚠️ เป็นแบบจำลองอย่างง่าย (rigid-body, แนวยาวทิศทางเดียว) ไม่รวมผลของระบบกันสะเทือน,
        ABS, แรงต้านอากาศ, ความชันถนน หรือสภาพยาง ระยะเบรกจริงแปรผันมากตามสภาพถนน/สภาพอากาศ —
        ห้ามใช้เป็นเกณฑ์ตัดสินระยะห่างปลอดภัยขณะขับขี่จริง
      </WarningBanner>

      <div className="mt-8 grid grid-cols-1 items-start gap-8 lg:grid-cols-[380px_1fr]">
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-medium text-slate-900">เงื่อนไขการเบรก</h2>
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label="ความเร็วเริ่มต้น"
              unit="km/h"
              value={input.initialSpeedKmh}
              onChange={(v) => update("initialSpeedKmh", v)}
            />
            <NumberField
              label="เวลาปฏิกิริยาคนขับ"
              unit="s"
              value={input.reactionTimeS}
              step={0.1}
              onChange={(v) => update("reactionTimeS", v)}
            />
          </div>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-slate-700">สภาพถนน (ตั้งค่าสัมประสิทธิ์แรงเสียดทาน)</span>
            <select
              className="rounded-md border border-slate-300 px-3 py-2 text-slate-900"
              onChange={(e) => update("frictionCoefficient", Number(e.target.value))}
              value={
                SURFACE_PRESETS.find((p) => p.mu === input.frictionCoefficient)?.mu ?? ""
              }
            >
              <option value="">— กำหนดเอง —</option>
              {SURFACE_PRESETS.map((p) => (
                <option key={p.label} value={p.mu}>
                  {p.label} (μ={p.mu})
                </option>
              ))}
            </select>
          </label>
          <NumberField
            label="สัมประสิทธิ์แรงเสียดทาน (μ)"
            value={input.frictionCoefficient}
            step={0.05}
            onChange={(v) => update("frictionCoefficient", v)}
          />

          <h2 className="pt-2 font-medium text-slate-900">ข้อมูลรถ</h2>
          <NumberField
            label="มวลรถ"
            unit="kg"
            value={input.vehicleMassKg}
            onChange={(v) => update("vehicleMassKg", v)}
          />
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label="ความสูงจุดศูนย์ถ่วง (CG)"
              unit="m"
              value={input.cgHeightM}
              step={0.05}
              onChange={(v) => update("cgHeightM", v)}
            />
            <NumberField
              label="ระยะฐานล้อ (Wheelbase)"
              unit="m"
              value={input.wheelbaseM}
              step={0.05}
              onChange={(v) => update("wheelbaseM", v)}
            />
          </div>
          <NumberField
            label="สัดส่วนน้ำหนักล้อหน้า (สถิต)"
            value={input.staticFrontWeightFraction}
            step={0.05}
            onChange={(v) => update("staticFrontWeightFraction", v)}
          />
        </div>

        <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
          <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-5">
            <div className="text-sm text-emerald-800">ระยะหยุดรวม (Total Stopping Distance)</div>
            <div className="text-2xl font-semibold text-emerald-900">
              {fmt(result.totalStoppingDistanceM, 1)} m
            </div>
            <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-emerald-900 sm:grid-cols-3">
              <div>ระยะช่วงปฏิกิริยา = {fmt(result.reactionDistanceM, 1)} m</div>
              <div>ระยะเบรก = {fmt(result.brakingDistanceM, 1)} m</div>
              <div>
                Deceleration = {fmt(result.decelerationMs2, 2)} m/s² (
                {fmt(result.decelerationG, 2)}g)
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm shadow-sm">
            <h3 className="mb-2 font-medium text-slate-900">การถ่ายน้ำหนัก (Weight Transfer)</h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-slate-600 sm:grid-cols-4">
              <div>
                ΔW = {fmt(result.weightTransferN, 0)} N
                <br />({fmt(result.weightTransferKgEquivalent, 1)} kg-eq.)
              </div>
              <div>
                น้ำหนักล้อหน้า (สถิต → ขณะเบรก)
                <br />
                {fmt(result.staticFrontLoadN, 0)} → {fmt(result.dynamicFrontLoadN, 0)} N
              </div>
              <div>
                น้ำหนักล้อหลัง (สถิต → ขณะเบรก)
                <br />
                {fmt(result.staticRearLoadN, 0)} → {fmt(result.dynamicRearLoadN, 0)} N
              </div>
              <div className="text-xs text-slate-400">
                ΔW = m·a·h_cg / wheelbase
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
