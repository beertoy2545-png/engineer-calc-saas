"use client";

import { useMemo, useState } from "react";
import {
  EARTH_MU_M3S2,
  EARTH_RADIUS_M,
  calculateOrbitalMechanics,
  calculateRocketEquation,
  type OrbitalMechanicsInput,
  type RocketEquationInput,
} from "@/lib/calculations/aerospace";
import { NumberField } from "@/components/ui/NumberField";
import { WarningBanner } from "@/components/ui/WarningBanner";
import { fmt } from "@/lib/format";

const DEFAULT_ROCKET: RocketEquationInput = {
  specificImpulseS: 311,
  wetMassKg: 500000,
  dryMassKg: 50000,
};

const DEFAULT_ORBIT: OrbitalMechanicsInput = {
  centralBodyMuM3S2: EARTH_MU_M3S2,
  centralBodyRadiusM: EARTH_RADIUS_M,
  altitudeM: 400000,
};

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.round(seconds % 60);
  return `${h}h ${m}m ${s}s`;
}

export default function AerospaceCalculator() {
  const [rocket, setRocket] = useState<RocketEquationInput>(DEFAULT_ROCKET);
  const [orbit, setOrbit] = useState<OrbitalMechanicsInput>(DEFAULT_ORBIT);

  const rocketResult = useMemo(() => calculateRocketEquation(rocket), [rocket]);
  const orbitResult = useMemo(() => calculateOrbitalMechanics(orbit), [orbit]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-slate-900">
        อวกาศยาน (Aerospace — Rocket Propulsion &amp; Orbital Mechanics)
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Tsiolkovsky Rocket Equation และกลศาสตร์วงโคจรวงกลม (Two-Body Circular
        Orbital Mechanics)
      </p>

      <WarningBanner>
        ⚠️ สมการจรวดให้ค่า Δv แบบอุดมคติ (สุญญากาศ ไม่มีแรงโน้มถ่วง/แรงต้านอากาศ) ค่า Δv
        จริงสำหรับการปล่อยจรวดจะสูงกว่านี้จาก gravity loss และ drag loss กลศาสตร์วงโคจร
        ครอบคลุมเฉพาะวงโคจรวงกลมเท่านั้น ไม่รวม Hohmann transfer หรือวงรี
      </WarningBanner>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Rocket equation */}
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-medium text-slate-900">
            สมการจรวด (Tsiolkovsky Rocket Equation)
          </h2>
          <NumberField
            label="Specific Impulse (Isp)"
            unit="s"
            value={rocket.specificImpulseS}
            onChange={(v) => setRocket((p) => ({ ...p, specificImpulseS: v }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label="มวลรวม (Wet Mass, m0)"
              unit="kg"
              value={rocket.wetMassKg}
              onChange={(v) => setRocket((p) => ({ ...p, wetMassKg: v }))}
            />
            <NumberField
              label="มวลแห้ง (Dry Mass, mf)"
              unit="kg"
              value={rocket.dryMassKg}
              onChange={(v) => setRocket((p) => ({ ...p, dryMassKg: v }))}
            />
          </div>

          <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-4">
            <div className="text-sm text-emerald-800">Δv (ideal, no losses)</div>
            <div className="text-2xl font-semibold text-emerald-900">
              {fmt(rocketResult.deltaVMs, 0)} m/s
            </div>
            <div className="mt-1 text-xs text-emerald-800">
              ({fmt(rocketResult.deltaVMs / 1000, 2)} km/s)
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-slate-600 sm:grid-cols-2">
            <div>v_exhaust = {fmt(rocketResult.exhaustVelocityMs, 1)} m/s</div>
            <div>Mass Ratio = {fmt(rocketResult.massRatio, 3)}</div>
            <div>มวลเชื้อเพลิง = {fmt(rocketResult.propellantMassKg, 0)} kg</div>
            <div>
              Propellant Fraction = {fmt(rocketResult.propellantMassFraction * 100, 1)}%
            </div>
          </div>
        </div>

        {/* Orbital mechanics */}
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-medium text-slate-900">
            กลศาสตร์วงโคจร (Circular Orbital Mechanics)
          </h2>
          <p className="text-xs text-slate-400">
            ค่าเริ่มต้นตั้งเป็นโลก (μ, R) — แก้ไขได้เพื่อคำนวณวงโคจรรอบดาวเคราะห์อื่น
          </p>
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label="μ (GM ของวัตถุศูนย์กลาง)"
              unit="m³/s²"
              value={orbit.centralBodyMuM3S2}
              onChange={(v) => setOrbit((p) => ({ ...p, centralBodyMuM3S2: v }))}
            />
            <NumberField
              label="รัศมีวัตถุศูนย์กลาง (R)"
              unit="m"
              value={orbit.centralBodyRadiusM}
              onChange={(v) => setOrbit((p) => ({ ...p, centralBodyRadiusM: v }))}
            />
          </div>
          <NumberField
            label="ความสูงวงโคจร (Altitude)"
            unit="m"
            value={orbit.altitudeM}
            onChange={(v) => setOrbit((p) => ({ ...p, altitudeM: v }))}
          />

          <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-4">
            <div className="text-sm text-emerald-800">ความเร็ววงโคจร (Circular)</div>
            <div className="text-2xl font-semibold text-emerald-900">
              {fmt(orbitResult.orbitalVelocityMs / 1000, 3)} km/s
            </div>
          </div>

          <div className="grid grid-cols-1 gap-1 text-sm text-slate-600">
            <div>รัศมีวงโคจร (r) = {fmt(orbitResult.orbitalRadiusM / 1000, 1)} km</div>
            <div>
              คาบการโคจร (T) = {formatDuration(orbitResult.orbitalPeriodS)} (
              {fmt(orbitResult.orbitalPeriodS / 60, 1)} นาที)
            </div>
            <div>
              ความเร็วหลุดพ้น (Escape Velocity) ={" "}
              {fmt(orbitResult.escapeVelocityMs / 1000, 3)} km/s
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
