"use client";

import { useMemo, useState } from "react";
import {
  BETZ_LIMIT,
  STANDARD_AIR_DENSITY_KG_M3,
  calculateSolarSizing,
  calculateWindPower,
  type SolarSizingInput,
  type WindPowerInput,
} from "@/lib/calculations/renewableEnergy";
import { NumberField } from "@/components/ui/NumberField";
import { WarningBanner } from "@/components/ui/WarningBanner";
import { fmt } from "@/lib/format";

const DEFAULT_SOLAR: SolarSizingInput = {
  dailyEnergyKwh: 20,
  peakSunHours: 5,
  deratingFactor: 0.8,
  panelWattage: 450,
};

const DEFAULT_WIND: WindPowerInput = {
  airDensityKgM3: STANDARD_AIR_DENSITY_KG_M3,
  rotorRadiusM: 40,
  windSpeedMs: 10,
  powerCoefficient: 0.4,
};

export default function RenewableEnergyCalculator() {
  const [solar, setSolar] = useState<SolarSizingInput>(DEFAULT_SOLAR);
  const [wind, setWind] = useState<WindPowerInput>(DEFAULT_WIND);

  const solarResult = useMemo(() => calculateSolarSizing(solar), [solar]);
  const windResult = useMemo(() => calculateWindPower(wind), [wind]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-slate-900">
        พลังงานทดแทน (Renewable Energy — Solar PV &amp; Wind Turbine)
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        ขนาดระบบโซลาร์เซลล์ที่ต้องการ (Solar PV Sizing) และกำลังผลิตของกังหันลม (Wind
        Turbine Power)
      </p>

      <WarningBanner>
        ⚠️ การคำนวณโซลาร์เป็นสมดุลพลังงานเฉลี่ยรายวันอย่างง่าย ไม่รวมการเปลี่ยนแปลงตามฤดูกาล
        เงา หรือการออกแบบระบบแบตเตอรี่ ส่วนกำลังกังหันลมเป็นค่า ณ ความเร็วลมจุดเดียว ไม่ใช่
        พลังงานที่ผลิตได้จริงตลอดปี (ต้องรวมกับการกระจายความเร็วลมและ Power Curve ของกังหัน)
      </WarningBanner>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Solar PV Sizing */}
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-medium text-slate-900">ขนาดระบบโซลาร์เซลล์ (Solar PV Sizing)</h2>
          <NumberField
            label="ความต้องการพลังงานต่อวัน"
            unit="kWh"
            value={solar.dailyEnergyKwh}
            onChange={(v) => setSolar((p) => ({ ...p, dailyEnergyKwh: v }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label="Peak Sun Hours"
              unit="h"
              value={solar.peakSunHours}
              step={0.1}
              onChange={(v) => setSolar((p) => ({ ...p, peakSunHours: v }))}
            />
            <NumberField
              label="Derating Factor"
              value={solar.deratingFactor}
              step={0.01}
              onChange={(v) => setSolar((p) => ({ ...p, deratingFactor: v }))}
            />
          </div>
          <NumberField
            label="กำลังไฟต่อแผง (Panel Wattage)"
            unit="W"
            value={solar.panelWattage}
            onChange={(v) => setSolar((p) => ({ ...p, panelWattage: v }))}
          />
          <p className="text-xs text-slate-400">
            * Peak Sun Hours ในไทยโดยทั่วไป ~4.5-5.5 ชม./วัน · Derating Factor ทั่วไป
            0.75-0.85
          </p>

          <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-4">
            <div className="text-sm text-emerald-800">ขนาดระบบที่ต้องการ</div>
            <div className="text-2xl font-semibold text-emerald-900">
              {fmt(solarResult.requiredArrayKw, 2)} kWp
            </div>
            <div className="mt-1 text-xs text-emerald-800">
              จำนวนแผง = {solarResult.panelCount} แผง (ติดตั้งจริง{" "}
              {fmt(solarResult.installedArrayKw, 2)} kWp)
            </div>
          </div>
        </div>

        {/* Wind Turbine Power */}
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-medium text-slate-900">กำลังผลิตกังหันลม (Wind Turbine Power)</h2>
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label="ความหนาแน่นอากาศ (ρ)"
              unit="kg/m³"
              value={wind.airDensityKgM3}
              step={0.01}
              onChange={(v) => setWind((p) => ({ ...p, airDensityKgM3: v }))}
            />
            <NumberField
              label="รัศมีใบพัด (R)"
              unit="m"
              value={wind.rotorRadiusM}
              onChange={(v) => setWind((p) => ({ ...p, rotorRadiusM: v }))}
            />
            <NumberField
              label="ความเร็วลม (v)"
              unit="m/s"
              value={wind.windSpeedMs}
              step={0.5}
              onChange={(v) => setWind((p) => ({ ...p, windSpeedMs: v }))}
            />
            <NumberField
              label="Power Coefficient (Cp)"
              value={wind.powerCoefficient}
              step={0.01}
              onChange={(v) => setWind((p) => ({ ...p, powerCoefficient: v }))}
            />
          </div>
          <p className="text-xs text-slate-400">
            * Betz Limit = {fmt(BETZ_LIMIT, 3)} (สูงสุดทางทฤษฎี) · กังหันจริงทั่วไป Cp
            ≈ 0.35-0.45
          </p>

          <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-4">
            <div className="text-sm text-emerald-800">กำลังผลิต ณ ความเร็วลมนี้</div>
            <div className="text-2xl font-semibold text-emerald-900">
              {fmt(windResult.powerW / 1000, 1)} kW
            </div>
            <div className="mt-1 text-xs text-emerald-800">
              พื้นที่กวาด = {fmt(windResult.sweptAreaM2, 1)} m² · Betz Limit Power ={" "}
              {fmt(windResult.betzLimitPowerW / 1000, 1)} kW · ประสิทธิภาพเทียบ Betz ={" "}
              {fmt(windResult.fractionOfBetzLimit * 100, 1)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
