"use client";

import { useMemo, useState } from "react";
import {
  STEAM_VELOCITY_RANGE_MS,
  calculateSteamSizing,
  type SteamSizingInput,
} from "@/lib/calculations/steamSizing";

function fmt(n: number, digits = 2) {
  if (!Number.isFinite(n)) return "-";
  return n.toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function Field({
  label,
  unit,
  value,
  onChange,
  step = 1,
}: {
  label: string;
  unit?: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-slate-700">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="number"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900"
          value={value}
          step={step}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        {unit && <span className="w-16 shrink-0 text-slate-500">{unit}</span>}
      </div>
    </label>
  );
}

const DEFAULT_INPUT: SteamSizingInput = {
  pressureBarg: 5,
  heatLoadKw: 500,
  material: "steel",
  velocityMinMs: STEAM_VELOCITY_RANGE_MS.min,
  velocityMaxMs: STEAM_VELOCITY_RANGE_MS.max,
};

export default function SteamSizingCalculator() {
  const [input, setInput] = useState<SteamSizingInput>(DEFAULT_INPUT);
  const output = useMemo(() => calculateSteamSizing(input), [input]);
  const recommended = output.results[output.recommendedIndex];

  const update = <K extends keyof SteamSizingInput>(
    key: K,
    value: SteamSizingInput[K],
  ) => setInput((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-slate-900">
        คำนวณระบบไอน้ำ (Steam Flow &amp; Pipe Sizing)
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        อ้างอิง ME444 บทที่ 11-12 — Saturated Steam Table, ṁ = Q<sub>load</sub>
        /h<sub>fg</sub>, ความเร็วไอน้ำแนะนำ 15–35 m/s
      </p>

      <div className="mt-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        ⚠️ ยังไม่รวมการคำนวณ Pressure Drop ตามความยาวท่อจริง และใช้ได้กับท่อเหล็ก
        (Steel SCH40) เท่านั้น — วัสดุอื่นอาจไม่ทนอุณหภูมิไอน้ำ กรุณาให้วิศวกรที่มีใบอนุญาต
        ตรวจสอบก่อนติดตั้งจริง
      </div>

      <div className="mt-8 grid grid-cols-1 items-start gap-8 lg:grid-cols-[380px_1fr]">
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-medium text-slate-900">เงื่อนไขไอน้ำ</h2>
          <Field
            label="ความดันไอน้ำ (gauge)"
            unit="barg"
            value={input.pressureBarg}
            step={0.5}
            onChange={(v) => update("pressureBarg", v)}
          />
          <Field
            label="ภาระความร้อนที่ต้องการ (Heat Load)"
            unit="kW"
            value={input.heatLoadKw}
            onChange={(v) => update("heatLoadKw", v)}
          />

          <h2 className="pt-2 font-medium text-slate-900">ช่วงความเร็วออกแบบ</h2>
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Vmin"
              unit="m/s"
              value={input.velocityMinMs}
              onChange={(v) => update("velocityMinMs", v)}
            />
            <Field
              label="Vmax"
              unit="m/s"
              value={input.velocityMaxMs}
              onChange={(v) => update("velocityMaxMs", v)}
            />
          </div>
          <p className="text-xs text-slate-400">
            * ค่ามาตรฐานทั่วไปสำหรับไอน้ำแรงดันต่ำ-กลาง: 15–35 m/s
          </p>

          <div className="rounded-md bg-slate-50 p-3 text-xs text-slate-500">
            คุณสมบัติไอน้ำที่ {fmt(input.pressureBarg, 1)} barg (interpolated):
            <br />
            T_sat = {fmt(output.steamProps.tSatC, 1)} °C · h_fg ={" "}
            {fmt(output.steamProps.hfgKjKg, 1)} kJ/kg · v_g ={" "}
            {fmt(output.steamProps.vgM3Kg, 4)} m³/kg
          </div>
        </div>

        <div className="space-y-6">
          {recommended && (
            <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-5">
              <div className="text-sm text-emerald-800">ขนาดท่อไอน้ำที่แนะนำ</div>
              <div className="text-2xl font-semibold text-emerald-900">
                {recommended.size.label}
              </div>
              <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-emerald-900 sm:grid-cols-3">
                <div>ṁ = {fmt(output.massFlowKgH, 0)} kg/hr</div>
                <div>V̇ = {fmt(output.volumeFlowM3S * 3600, 1)} m³/hr</div>
                <div>v = {fmt(recommended.velocityMs)} m/s</div>
              </div>
              <div className="mt-1 text-xs text-emerald-800">
                {recommended.velocityInRange
                  ? "ความเร็วอยู่ในช่วงแนะนำ ✓"
                  : "ไม่มีขนาดใดอยู่ในช่วงแนะนำพอดี — แสดงขนาดที่ใกล้เคียงที่สุด ⚠️"}
              </div>
            </div>
          )}

          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[480px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-slate-600">
                  <th className="px-3 py-2 font-medium">ขนาดท่อ (Steel SCH40)</th>
                  <th className="px-3 py-2 font-medium">ID (mm)</th>
                  <th className="px-3 py-2 font-medium">v (m/s)</th>
                  <th className="px-3 py-2 font-medium">เหมาะสม?</th>
                </tr>
              </thead>
              <tbody>
                {output.results.map((r, idx) => (
                  <tr
                    key={r.size.label}
                    className={
                      idx === output.recommendedIndex
                        ? "bg-emerald-50 font-medium"
                        : "border-b border-slate-100 last:border-0"
                    }
                  >
                    <td className="px-3 py-2">{r.size.label}</td>
                    <td className="px-3 py-2">{fmt(r.size.idMm, 1)}</td>
                    <td className="px-3 py-2">{fmt(r.velocityMs)}</td>
                    <td className="px-3 py-2">{r.velocityInRange ? "✓" : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
