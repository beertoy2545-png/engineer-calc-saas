"use client";

import { useMemo, useState } from "react";
import {
  INSTALL_METHOD_LABEL,
  calculateCableSizing,
  type CableSizingInput,
  type InstallMethod,
  type Phase,
} from "@/lib/calculations/cableSizing";
import { NumberField } from "@/components/ui/NumberField";
import { WarningBanner } from "@/components/ui/WarningBanner";
import { fmt } from "@/lib/format";

const DEFAULT_INPUT: CableSizingInput = {
  phase: "three",
  loadPowerKw: 30,
  voltageV: 400,
  powerFactor: 0.9,
  installMethod: "C",
  ambientTempC: 30,
  groupedCircuits: 1,
  lengthM: 50,
  maxVoltageDropPct: 5,
};

export default function CableSizingCalculator() {
  const [input, setInput] = useState<CableSizingInput>(DEFAULT_INPUT);
  const output = useMemo(() => calculateCableSizing(input), [input]);
  const recommended = output.results[output.recommendedIndex];

  const update = <K extends keyof CableSizingInput>(
    key: K,
    value: CableSizingInput[K],
  ) => setInput((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-slate-900">
        คำนวณขนาดสายไฟและแรงดันตก (Cable Sizing &amp; Voltage Drop)
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        อ้างอิง IEC 60364-5-52 — Table B.52.2 (Current Rating), B.52.14 (Ambient
        Temp.), B.52.17 (Grouping)
      </p>

      <WarningBanner>
        ⚠️ รองรับเฉพาะสายทองแดงฉนวน PVC (70°C) เท่านั้นในเวอร์ชันนี้ และการคำนวณ
        Voltage Drop ยังไม่รวมค่า Reactance (X) ของสาย — แม่นยำน้อยลงสำหรับสายขนาดใหญ่กว่า
        95 mm² กรุณาให้วิศวกรไฟฟ้าที่มีใบอนุญาตตรวจสอบก่อนติดตั้งจริง
      </WarningBanner>

      <div className="mt-8 grid grid-cols-1 items-start gap-8 lg:grid-cols-[380px_1fr]">
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-medium text-slate-900">โหลดไฟฟ้า</h2>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-slate-700">ระบบไฟ</span>
            <select
              className="rounded-md border border-slate-300 px-3 py-2 text-slate-900"
              value={input.phase}
              onChange={(e) => update("phase", e.target.value as Phase)}
            >
              <option value="single">1 เฟส (Single Phase)</option>
              <option value="three">3 เฟส (Three Phase)</option>
            </select>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label="กำลังไฟฟ้า (Load)"
              unit="kW"
              value={input.loadPowerKw}
              onChange={(v) => update("loadPowerKw", v)}
            />
            <NumberField
              label="แรงดันไฟฟ้า"
              unit="V"
              value={input.voltageV}
              onChange={(v) => update("voltageV", v)}
            />
          </div>
          <NumberField
            label="Power Factor (cos φ)"
            value={input.powerFactor}
            step={0.01}
            onChange={(v) => update("powerFactor", v)}
          />

          <h2 className="pt-2 font-medium text-slate-900">การติดตั้ง</h2>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-slate-700">วิธีติดตั้ง (Reference Method)</span>
            <select
              className="rounded-md border border-slate-300 px-3 py-2 text-slate-900"
              value={input.installMethod}
              onChange={(e) =>
                update("installMethod", e.target.value as InstallMethod)
              }
            >
              {(Object.keys(INSTALL_METHOD_LABEL) as InstallMethod[]).map(
                (key) => (
                  <option key={key} value={key}>
                    {INSTALL_METHOD_LABEL[key]}
                  </option>
                ),
              )}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label="อุณหภูมิแวดล้อม"
              unit="°C"
              value={input.ambientTempC}
              onChange={(v) => update("ambientTempC", v)}
            />
            <NumberField
              label="จำนวนวงจรที่มัดรวมกัน"
              unit="วงจร"
              value={input.groupedCircuits}
              onChange={(v) => update("groupedCircuits", v)}
            />
          </div>

          <h2 className="pt-2 font-medium text-slate-900">ระยะทางและแรงดันตก</h2>
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label="ความยาวสาย"
              unit="m"
              value={input.lengthM}
              onChange={(v) => update("lengthM", v)}
            />
            <NumberField
              label="Voltage Drop สูงสุด"
              unit="%"
              value={input.maxVoltageDropPct}
              step={0.5}
              onChange={(v) => update("maxVoltageDropPct", v)}
            />
          </div>
        </div>

        <div className="space-y-6">
          {recommended && (
            <div
              className={`rounded-xl border p-5 ${
                recommended.suitable
                  ? "border-emerald-300 bg-emerald-50"
                  : "border-red-300 bg-red-50"
              }`}
            >
              <div
                className={
                  recommended.suitable ? "text-sm text-emerald-800" : "text-sm text-red-800"
                }
              >
                ขนาดสายที่แนะนำ
              </div>
              <div
                className={`text-2xl font-semibold ${
                  recommended.suitable ? "text-emerald-900" : "text-red-900"
                }`}
              >
                {recommended.crossSectionMm2} mm²
              </div>
              <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-4">
                <div>Ib = {fmt(output.designCurrentA)} A</div>
                <div>Ca × Cg = {fmt(output.ambientFactor * output.groupFactor, 2)}</div>
                <div>
                  Iz (derated) = {fmt(recommended.deratedCurrentA)} A
                </div>
                <div>
                  Vd = {fmt(recommended.voltageDropV)} V (
                  {fmt(recommended.voltageDropPct)}%)
                </div>
              </div>
              {!recommended.suitable && (
                <div className="mt-2 text-xs text-red-800">
                  ⚠️ ไม่มีขนาดสายในตารางที่ผ่านทั้งเกณฑ์กระแสและแรงดันตก —
                  พิจารณาเพิ่มขนาดสายเป็นพิเศษ หรือแบ่งวงจร
                </div>
              )}
            </div>
          )}

          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-slate-600">
                  <th className="px-3 py-2 font-medium">ขนาด (mm²)</th>
                  <th className="px-3 py-2 font-medium">Iz ตาราง (A)</th>
                  <th className="px-3 py-2 font-medium">Iz derated (A)</th>
                  <th className="px-3 py-2 font-medium">กระแสผ่าน?</th>
                  <th className="px-3 py-2 font-medium">Vd (%)</th>
                  <th className="px-3 py-2 font-medium">Vd ผ่าน?</th>
                </tr>
              </thead>
              <tbody>
                {output.results.map((r, idx) => (
                  <tr
                    key={r.crossSectionMm2}
                    className={
                      idx === output.recommendedIndex
                        ? "bg-emerald-50 font-medium"
                        : "border-b border-slate-100 last:border-0"
                    }
                  >
                    <td className="px-3 py-2">{r.crossSectionMm2}</td>
                    <td className="px-3 py-2">{fmt(r.ratedCurrentA, 1)}</td>
                    <td className="px-3 py-2">{fmt(r.deratedCurrentA, 1)}</td>
                    <td className="px-3 py-2">{r.ampacityOk ? "✓" : "—"}</td>
                    <td className="px-3 py-2">{fmt(r.voltageDropPct, 2)}</td>
                    <td className="px-3 py-2">{r.voltageDropOk ? "✓" : "—"}</td>
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
