"use client";

import { useMemo, useState } from "react";
import {
  IMO_MINIMUM_GM_M,
  calculateShipStability,
  type ShipStabilityInput,
} from "@/lib/calculations/shipStability";
import { NumberField } from "@/components/ui/NumberField";
import { WarningBanner } from "@/components/ui/WarningBanner";
import { fmt } from "@/lib/format";

const DEFAULT_INPUT: ShipStabilityInput = {
  lengthM: 50,
  beamM: 10,
  draftM: 3,
  kgM: 4,
  waterDensityTM3: 1.025,
};

export default function ShipStabilityCalculator() {
  const [input, setInput] = useState<ShipStabilityInput>(DEFAULT_INPUT);
  const result = useMemo(() => calculateShipStability(input), [input]);

  const update = <K extends keyof ShipStabilityInput>(
    key: K,
    value: ShipStabilityInput[K],
  ) => setInput((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-slate-900">
        เสถียรภาพเรือ (Ship/Barge Stability — Metacentric Height)
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        คำนวณ GM (Metacentric Height) เบื้องต้นสำหรับตัวเรือทรงกล่อง (Box-Shaped Hull /
        Barge) — GM &gt; 0 หมายถึงเรือมีเสถียรภาพเบื้องต้น
      </p>

      <WarningBanner>
        ⚠️ ใช้ได้เฉพาะตัวเรือทรงกล่องสี่เหลี่ยม (Box-Shaped Hull) เท่านั้น เรือจริงมีรูปทรงตัวเรือ
        ซับซ้อนกว่านี้มาก ต้องใช้ Hydrostatic Curves จากแบบเรือจริง ไม่รวมผล Free Surface
        Correction (FSC) จากถังของเหลวที่ไม่เต็ม หรือเสถียรภาพมุมเอียงขนาดใหญ่ (GZ Curve)
        กรุณาให้วิศวกรต่อเรือ (Naval Architect) ที่มีใบอนุญาตตรวจสอบก่อนใช้งานจริง
      </WarningBanner>

      <div className="mt-8 grid grid-cols-1 items-start gap-8 lg:grid-cols-[380px_1fr]">
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-medium text-slate-900">ขนาดตัวเรือ</h2>
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label="ความยาว (L)"
              unit="m"
              value={input.lengthM}
              onChange={(v) => update("lengthM", v)}
            />
            <NumberField
              label="ความกว้าง (B)"
              unit="m"
              value={input.beamM}
              onChange={(v) => update("beamM", v)}
            />
          </div>
          <NumberField
            label="กินน้ำลึก (Draft, T)"
            unit="m"
            value={input.draftM}
            step={0.1}
            onChange={(v) => update("draftM", v)}
          />
          <NumberField
            label="ความสูงจุดศูนย์ถ่วง (KG)"
            unit="m"
            value={input.kgM}
            step={0.1}
            onChange={(v) => update("kgM", v)}
          />
          <NumberField
            label="ความหนาแน่นน้ำ (ρ)"
            unit="t/m³"
            value={input.waterDensityTM3}
            step={0.005}
            onChange={(v) => update("waterDensityTM3", v)}
          />
          <p className="text-xs text-slate-400">
            * น้ำทะเล ρ≈1.025 t/m³ · น้ำจืด ρ≈1.000 t/m³
          </p>
        </div>

        <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
          <div
            className={`rounded-xl border p-5 ${
              result.meetsImoMinimum
                ? "border-emerald-300 bg-emerald-50"
                : "border-red-300 bg-red-50"
            }`}
          >
            <div
              className={
                result.meetsImoMinimum ? "text-sm text-emerald-800" : "text-sm text-red-800"
              }
            >
              GM (Metacentric Height)
            </div>
            <div
              className={`text-2xl font-semibold ${
                result.meetsImoMinimum ? "text-emerald-900" : "text-red-900"
              }`}
            >
              {fmt(result.gmM, 3)} m
            </div>
            <div className="mt-2 text-xs">
              {!result.isStable
                ? "⚠️ GM < 0 — ไม่เสถียร (เสี่ยงพลิกคว่ำ) ต้องลดความสูง KG หรือเพิ่มความกว้าง B"
                : result.meetsImoMinimum
                  ? `✓ GM ≥ ${IMO_MINIMUM_GM_M} m (เกณฑ์ขั้นต่ำ IMO IS Code 2008)`
                  : `⚠️ GM > 0 แต่ต่ำกว่าเกณฑ์ขั้นต่ำ IMO (${IMO_MINIMUM_GM_M} m)`}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm shadow-sm">
            <h3 className="mb-2 font-medium text-slate-900">องค์ประกอบการคำนวณ</h3>
            <div className="flex justify-between border-b border-slate-100 py-1.5">
              <span className="text-slate-600">Displacement Volume (V)</span>
              <span className="font-medium text-slate-900">
                {fmt(result.displacementVolumeM3, 1)} m³
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-100 py-1.5">
              <span className="text-slate-600">Displacement (Δ)</span>
              <span className="font-medium text-slate-900">
                {fmt(result.displacementTonnes, 1)} tonnes
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-100 py-1.5">
              <span className="text-slate-600">KB (ศูนย์กลางการลอยตัว)</span>
              <span className="font-medium text-slate-900">{fmt(result.kbM, 3)} m</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 py-1.5">
              <span className="text-slate-600">BM (รัศมีเมตาเซนตริก)</span>
              <span className="font-medium text-slate-900">{fmt(result.bmM, 3)} m</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-600">KM = KB + BM</span>
              <span className="font-medium text-slate-900">{fmt(result.kmM, 3)} m</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">
            <h3 className="mb-2 font-medium text-slate-900">สูตรที่ใช้ (Box Hull)</h3>
            <p className="font-mono text-xs text-slate-500">
              KB = T/2
              <br />
              BM = B² / (12·T)
              <br />
              GM = KB + BM − KG
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
