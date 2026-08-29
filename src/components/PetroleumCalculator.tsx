"use client";

import { useMemo, useState } from "react";
import {
  calculateGasInPlace,
  calculateOilInPlace,
  calculateWellInflow,
  type VolumetricInput,
  type WellInflowInput,
} from "@/lib/calculations/petroleum";
import { NumberField } from "@/components/ui/NumberField";
import { WarningBanner } from "@/components/ui/WarningBanner";
import { fmt } from "@/lib/format";

const DEFAULT_OIL_VOL: VolumetricInput = {
  areaAcres: 640,
  netPayFt: 50,
  porosityFrac: 0.22,
  waterSaturationFrac: 0.25,
  formationVolumeFactor: 1.35,
};

const DEFAULT_GAS_VOL: VolumetricInput = {
  areaAcres: 640,
  netPayFt: 50,
  porosityFrac: 0.22,
  waterSaturationFrac: 0.25,
  formationVolumeFactor: 0.0055,
};

const DEFAULT_INFLOW: WellInflowInput = {
  permeabilityMd: 50,
  netPayFt: 30,
  reservoirPressurePsi: 3000,
  flowingBhpPsi: 2000,
  oilViscosityCp: 1.5,
  oilFvfRbStb: 1.2,
  drainageRadiusFt: 1000,
  wellboreRadiusFt: 0.328,
  skinFactor: 0,
};

export default function PetroleumCalculator() {
  const [fluidType, setFluidType] = useState<"oil" | "gas">("oil");
  const [oilVol, setOilVol] = useState(DEFAULT_OIL_VOL);
  const [gasVol, setGasVol] = useState(DEFAULT_GAS_VOL);
  const [inflow, setInflow] = useState<WellInflowInput>(DEFAULT_INFLOW);

  const ooip = useMemo(() => calculateOilInPlace(oilVol), [oilVol]);
  const ogip = useMemo(() => calculateGasInPlace(gasVol), [gasVol]);
  const inflowResult = useMemo(() => calculateWellInflow(inflow), [inflow]);

  const vol = fluidType === "oil" ? oilVol : gasVol;
  const setVol = fluidType === "oil" ? setOilVol : setGasVol;
  const update = <K extends keyof VolumetricInput>(key: K, v: VolumetricInput[K]) =>
    setVol((prev) => ({ ...prev, [key]: v }));

  const updateInflow = <K extends keyof WellInflowInput>(key: K, v: WellInflowInput[K]) =>
    setInflow((prev) => ({ ...prev, [key]: v }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-slate-900">
        วิศวกรรมปิโตรเลียม (Petroleum — Reserves &amp; Well Inflow)
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        คำนวณปริมาณสำรองน้ำมัน/ก๊าซด้วยวิธีปริมาตร (Volumetric Method) และอัตราการไหลเข้าหลุม
        ด้วยกฎของ Darcy — ใช้หน่วยมาตรฐานอุตสาหกรรม (Oilfield Units)
      </p>

      <WarningBanner>
        ⚠️ ค่าปริมาณสำรองขึ้นกับความแม่นยำของพารามิเตอร์แหล่งกักเก็บ (จาก log/core/seismic)
        อย่างมาก และสมการการไหลเข้าหลุมใช้สมมติฐาน Pseudo-Steady-State การไหลแบบเฟสเดียว
        สมมาตรตามแนวรัศมี — ไม่รวม Multiphase Flow หรือหลุมที่ทำ Hydraulic Fracturing
        กรุณาให้วิศวกรแหล่งกักเก็บที่มีคุณสมบัติตรวจสอบก่อนใช้งานจริง
      </WarningBanner>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Volumetric OOIP/OGIP */}
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-medium text-slate-900">
              ปริมาณสำรองด้วยวิธีปริมาตร (Volumetric)
            </h2>
            <div className="flex gap-1">
              <button
                onClick={() => setFluidType("oil")}
                className={`rounded-md px-3 py-1 text-xs font-medium ${
                  fluidType === "oil"
                    ? "bg-slate-900 text-white"
                    : "border border-slate-300 text-slate-600"
                }`}
              >
                น้ำมัน
              </button>
              <button
                onClick={() => setFluidType("gas")}
                className={`rounded-md px-3 py-1 text-xs font-medium ${
                  fluidType === "gas"
                    ? "bg-slate-900 text-white"
                    : "border border-slate-300 text-slate-600"
                }`}
              >
                ก๊าซ
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label="พื้นที่ (A)"
              unit="acres"
              value={vol.areaAcres}
              onChange={(v) => update("areaAcres", v)}
            />
            <NumberField
              label="ความหนาชั้นหิน (h)"
              unit="ft"
              value={vol.netPayFt}
              onChange={(v) => update("netPayFt", v)}
            />
            <NumberField
              label="ความพรุน (φ)"
              value={vol.porosityFrac}
              step={0.01}
              onChange={(v) => update("porosityFrac", v)}
            />
            <NumberField
              label="ความอิ่มตัวน้ำ (Sw)"
              value={vol.waterSaturationFrac}
              step={0.01}
              onChange={(v) => update("waterSaturationFrac", v)}
            />
          </div>
          <NumberField
            label={fluidType === "oil" ? "Boi (RB/STB)" : "Bgi (rcf/scf)"}
            value={vol.formationVolumeFactor}
            step={fluidType === "oil" ? 0.01 : 0.0001}
            onChange={(v) => update("formationVolumeFactor", v)}
          />

          <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-4">
            <div className="text-sm text-emerald-800">
              {fluidType === "oil" ? "OOIP (Original Oil In Place)" : "OGIP (Original Gas In Place)"}
            </div>
            <div className="text-2xl font-semibold text-emerald-900">
              {fluidType === "oil"
                ? `${fmt(ooip / 1e6, 2)} MMSTB`
                : `${fmt(ogip / 1e9, 2)} Bcf`}
            </div>
            <div className="mt-1 text-xs text-emerald-800">
              {fluidType === "oil"
                ? `${fmt(ooip, 0)} STB`
                : `${fmt(ogip, 0)} scf`}
            </div>
          </div>
        </div>

        {/* Well inflow */}
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-medium text-slate-900">
            อัตราการไหลเข้าหลุม (Well Inflow — Darcy Radial Flow)
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label="Permeability (k)"
              unit="md"
              value={inflow.permeabilityMd}
              onChange={(v) => updateInflow("permeabilityMd", v)}
            />
            <NumberField
              label="ความหนาชั้นหิน (h)"
              unit="ft"
              value={inflow.netPayFt}
              onChange={(v) => updateInflow("netPayFt", v)}
            />
            <NumberField
              label="Pe (ความดันแหล่งกักเก็บ)"
              unit="psi"
              value={inflow.reservoirPressurePsi}
              onChange={(v) => updateInflow("reservoirPressurePsi", v)}
            />
            <NumberField
              label="Pwf (ความดันก้นหลุม)"
              unit="psi"
              value={inflow.flowingBhpPsi}
              onChange={(v) => updateInflow("flowingBhpPsi", v)}
            />
            <NumberField
              label="ความหนืดน้ำมัน (μ)"
              unit="cp"
              value={inflow.oilViscosityCp}
              step={0.1}
              onChange={(v) => updateInflow("oilViscosityCp", v)}
            />
            <NumberField
              label="Bo (RB/STB)"
              value={inflow.oilFvfRbStb}
              step={0.01}
              onChange={(v) => updateInflow("oilFvfRbStb", v)}
            />
            <NumberField
              label="รัศมีระบายน้ำมัน (re)"
              unit="ft"
              value={inflow.drainageRadiusFt}
              onChange={(v) => updateInflow("drainageRadiusFt", v)}
            />
            <NumberField
              label="รัศมีหลุม (rw)"
              unit="ft"
              value={inflow.wellboreRadiusFt}
              step={0.01}
              onChange={(v) => updateInflow("wellboreRadiusFt", v)}
            />
          </div>
          <NumberField
            label="Skin Factor (s)"
            value={inflow.skinFactor}
            step={0.5}
            onChange={(v) => updateInflow("skinFactor", v)}
          />

          <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-4">
            <div className="text-sm text-emerald-800">อัตราการผลิต (q)</div>
            <div className="text-2xl font-semibold text-emerald-900">
              {fmt(inflowResult.flowRateStbDay, 1)} STB/day
            </div>
            <div className="mt-1 text-xs text-emerald-800">
              Productivity Index (J) = {fmt(inflowResult.productivityIndexStbDayPerPsi, 3)}{" "}
              STB/day/psi
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
