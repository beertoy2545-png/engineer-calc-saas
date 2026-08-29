"use client";

import { useMemo, useState } from "react";
import {
  calculateSecondOrderResponse,
  calculateZieglerNicholsTuning,
  type SecondOrderInput,
  type ZieglerNicholsInput,
} from "@/lib/calculations/controlSystems";
import { NumberField } from "@/components/ui/NumberField";
import { WarningBanner } from "@/components/ui/WarningBanner";
import { fmt } from "@/lib/format";

const DEFAULT_SO: SecondOrderInput = { naturalFreqRadS: 10, dampingRatio: 0.5 };
const DEFAULT_ZN: ZieglerNicholsInput = { ultimateGainKu: 8, ultimatePeriodTuS: 2 };

export default function ControlSystemsCalculator() {
  const [soInput, setSoInput] = useState<SecondOrderInput>(DEFAULT_SO);
  const [znInput, setZnInput] = useState<ZieglerNicholsInput>(DEFAULT_ZN);

  const soResult = useMemo(() => calculateSecondOrderResponse(soInput), [soInput]);
  const znResult = useMemo(() => calculateZieglerNicholsTuning(znInput), [znInput]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-slate-900">
        ระบบควบคุม (Control Systems — Transient Response &amp; PID Tuning)
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        วิเคราะห์การตอบสนองของระบบอันดับสอง (2nd-Order Step Response) และปรับจูน PID
        ด้วยวิธี Ziegler-Nichols (Closed-Loop / Ultimate Sensitivity)
      </p>

      <WarningBanner>
        ⚠️ ค่า Ziegler-Nichols เป็นจุดเริ่มต้นสำหรับปรับจูน (ให้ overshoot ประมาณ 25%) ไม่ใช่ค่า
        สุดท้ายสำหรับใช้งานจริง ต้องทดสอบและปรับละเอียดกับระบบจริงเสมอ
        ระวังการทดสอบหาค่า Ku (ultimate gain) เพราะระบบจะสั่นต่อเนื่อง — ควรทำในสภาพแวดล้อม
        ที่ปลอดภัยเท่านั้น
      </WarningBanner>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Second order response */}
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-medium text-slate-900">
            การตอบสนองระบบอันดับสอง (Step Response)
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label="Natural Frequency (ωn)"
              unit="rad/s"
              value={soInput.naturalFreqRadS}
              onChange={(v) => setSoInput((p) => ({ ...p, naturalFreqRadS: v }))}
            />
            <NumberField
              label="Damping Ratio (ζ)"
              value={soInput.dampingRatio}
              step={0.05}
              onChange={(v) => setSoInput((p) => ({ ...p, dampingRatio: v }))}
            />
          </div>

          {!soResult.isUnderdamped && (
            <div className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
              ζ ≥ 1: ระบบเป็น Critically Damped หรือ Overdamped — ไม่มี Overshoot/การสั่น
            </div>
          )}

          <div className="rounded-lg bg-slate-50 p-4 text-sm">
            <div className="flex justify-between border-b border-slate-100 py-1.5">
              <span className="text-slate-600">Damped Frequency (ωd)</span>
              <span className="font-medium text-slate-900">
                {soResult.isUnderdamped ? `${fmt(soResult.dampedFreqRadS)} rad/s` : "-"}
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-100 py-1.5">
              <span className="text-slate-600">Delay Time (td)</span>
              <span className="font-medium text-slate-900">{fmt(soResult.delayTimeS)} s</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 py-1.5">
              <span className="text-slate-600">Rise Time (tr)</span>
              <span className="font-medium text-slate-900">
                {soResult.riseTimeS !== null ? `${fmt(soResult.riseTimeS)} s` : "-"}
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-100 py-1.5">
              <span className="text-slate-600">Peak Time (tp)</span>
              <span className="font-medium text-slate-900">
                {soResult.peakTimeS !== null ? `${fmt(soResult.peakTimeS)} s` : "-"}
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-100 py-1.5">
              <span className="text-slate-600">%Overshoot</span>
              <span className="font-medium text-slate-900">
                {soResult.percentOvershoot !== null
                  ? `${fmt(soResult.percentOvershoot)}%`
                  : "-"}
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-100 py-1.5">
              <span className="text-slate-600">Settling Time (2%)</span>
              <span className="font-medium text-slate-900">
                {fmt(soResult.settlingTime2PctS)} s
              </span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-600">Settling Time (5%)</span>
              <span className="font-medium text-slate-900">
                {fmt(soResult.settlingTime5PctS)} s
              </span>
            </div>
          </div>
        </div>

        {/* Ziegler-Nichols tuning */}
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-medium text-slate-900">
            Ziegler-Nichols PID Tuning (Closed-Loop)
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label="Ultimate Gain (Ku)"
              value={znInput.ultimateGainKu}
              step={0.1}
              onChange={(v) => setZnInput((p) => ({ ...p, ultimateGainKu: v }))}
            />
            <NumberField
              label="Ultimate Period (Tu)"
              unit="s"
              value={znInput.ultimatePeriodTuS}
              step={0.1}
              onChange={(v) => setZnInput((p) => ({ ...p, ultimatePeriodTuS: v }))}
            />
          </div>
          <p className="text-xs text-slate-400">
            * หา Ku, Tu จากการเพิ่มเกน P ล้วนๆ จนระบบสั่นต่อเนื่องคงที่ (sustained
            oscillation) — Tu คือคาบการสั่นนั้น
          </p>

          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-slate-600">
                  <th className="px-3 py-2 font-medium">Controller</th>
                  <th className="px-3 py-2 font-medium">Kp</th>
                  <th className="px-3 py-2 font-medium">Ti (s)</th>
                  <th className="px-3 py-2 font-medium">Td (s)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100">
                  <td className="px-3 py-2 font-medium">P</td>
                  <td className="px-3 py-2">{fmt(znResult.p.kp)}</td>
                  <td className="px-3 py-2 text-slate-400">-</td>
                  <td className="px-3 py-2 text-slate-400">-</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="px-3 py-2 font-medium">PI</td>
                  <td className="px-3 py-2">{fmt(znResult.pi.kp)}</td>
                  <td className="px-3 py-2">{fmt(znResult.pi.ti!)}</td>
                  <td className="px-3 py-2 text-slate-400">-</td>
                </tr>
                <tr className="bg-emerald-50">
                  <td className="px-3 py-2 font-medium">PID</td>
                  <td className="px-3 py-2 font-medium">{fmt(znResult.pid.kp)}</td>
                  <td className="px-3 py-2 font-medium">{fmt(znResult.pid.ti!)}</td>
                  <td className="px-3 py-2 font-medium">{fmt(znResult.pid.td!)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="rounded-md bg-slate-50 p-3 text-xs text-slate-500">
            Kp=0.6·Ku, Ti=0.5·Tu, Td=0.125·Tu (PID) — คาดหวัง overshoot ประมาณ 25%
          </div>
        </div>
      </div>
    </div>
  );
}
