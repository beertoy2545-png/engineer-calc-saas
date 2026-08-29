"use client";

import { useMemo, useState } from "react";
import {
  calculateDescriptiveStats,
  calculateLinearRegression,
  parseNumberList,
} from "@/lib/calculations/statistics";
import { WarningBanner } from "@/components/ui/WarningBanner";
import { fmt } from "@/lib/format";

const DEFAULT_DATA = "23.1, 24.5, 22.8, 25.0, 23.9, 24.2, 23.5, 24.8, 22.9, 23.6";
const DEFAULT_X = "1, 2, 3, 4, 5, 6, 7, 8";
const DEFAULT_Y = "12.1, 14.8, 17.2, 19.5, 22.0, 24.1, 26.8, 29.0";

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-slate-100 py-1.5 text-sm">
      <span className="text-slate-600">{label}</span>
      <span className="font-medium text-slate-900">{value}</span>
    </div>
  );
}

export default function StatisticsCalculator() {
  const [dataText, setDataText] = useState(DEFAULT_DATA);
  const [xText, setXText] = useState(DEFAULT_X);
  const [yText, setYText] = useState(DEFAULT_Y);

  const data = useMemo(() => parseNumberList(dataText), [dataText]);
  const stats = useMemo(() => calculateDescriptiveStats(data), [data]);

  const xs = useMemo(() => parseNumberList(xText), [xText]);
  const ys = useMemo(() => parseNumberList(yText), [yText]);
  const regression = useMemo(
    () => (xs.length === ys.length ? calculateLinearRegression(xs, ys) : null),
    [xs, ys],
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-slate-900">
        วิเคราะห์ข้อมูล (Statistics &amp; Linear Regression)
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        เครื่องมือช่วยวิเคราะห์ข้อมูลวิจัย/ทดลอง — สถิติเชิงพรรณนาและการถดถอยเชิงเส้น
        (Least-Squares Linear Regression)
      </p>

      <WarningBanner>
        ⚠️ ใช้สำหรับการวิเคราะห์ข้อมูลเบื้องต้นเท่านั้น ไม่รวมการทดสอบสมมติฐานทางสถิติ
        (hypothesis testing), การตรวจสอบ outlier อัตโนมัติ, หรือ regression ที่ไม่ใช่เชิงเส้น
      </WarningBanner>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Descriptive statistics */}
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-medium text-slate-900">สถิติเชิงพรรณนา (Descriptive Statistics)</h2>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-slate-700">ข้อมูล (คั่นด้วยลูกน้ำ/เว้นวรรค/ขึ้นบรรทัดใหม่)</span>
            <textarea
              className="h-28 rounded-md border border-slate-300 px-3 py-2 font-mono text-sm text-slate-900"
              value={dataText}
              onChange={(e) => setDataText(e.target.value)}
            />
          </label>
          <p className="text-xs text-slate-400">n = {data.length} จุดข้อมูลที่อ่านได้</p>

          {stats ? (
            <div className="rounded-lg bg-slate-50 p-4">
              <StatRow label="n" value={fmt(stats.n, 0)} />
              <StatRow label="ผลรวม (Sum)" value={fmt(stats.sum)} />
              <StatRow label="ค่าเฉลี่ย (Mean)" value={fmt(stats.mean)} />
              <StatRow label="มัธยฐาน (Median)" value={fmt(stats.median)} />
              <StatRow label="ค่าต่ำสุด (Min)" value={fmt(stats.min)} />
              <StatRow label="ค่าสูงสุด (Max)" value={fmt(stats.max)} />
              <StatRow label="พิสัย (Range)" value={fmt(stats.range)} />
              <StatRow
                label="ส่วนเบี่ยงเบนมาตรฐาน (Sample SD, n-1)"
                value={fmt(stats.sampleStdDev)}
              />
              <StatRow
                label="ความแปรปรวน (Sample Variance)"
                value={fmt(stats.sampleVariance)}
              />
              <StatRow
                label="ส่วนเบี่ยงเบนมาตรฐาน (Population SD)"
                value={fmt(stats.populationStdDev)}
              />
            </div>
          ) : (
            <p className="text-sm text-red-600">กรุณากรอกข้อมูลอย่างน้อย 1 ค่า</p>
          )}
        </div>

        {/* Linear regression */}
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-medium text-slate-900">
            การถดถอยเชิงเส้น (Linear Regression, y = mx + b)
          </h2>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-slate-700">ค่า X</span>
            <textarea
              className="h-16 rounded-md border border-slate-300 px-3 py-2 font-mono text-sm text-slate-900"
              value={xText}
              onChange={(e) => setXText(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-slate-700">ค่า Y</span>
            <textarea
              className="h-16 rounded-md border border-slate-300 px-3 py-2 font-mono text-sm text-slate-900"
              value={yText}
              onChange={(e) => setYText(e.target.value)}
            />
          </label>
          <p className="text-xs text-slate-400">
            X: {xs.length} จุด, Y: {ys.length} จุด{" "}
            {xs.length !== ys.length && (
              <span className="text-red-600">— จำนวนจุด X และ Y ต้องเท่ากัน</span>
            )}
          </p>

          {regression ? (
            <>
              <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-4">
                <div className="text-sm text-emerald-800">สมการถดถอย</div>
                <div className="text-lg font-semibold text-emerald-900">
                  y = {fmt(regression.slope, 4)}x + {fmt(regression.intercept, 4)}
                </div>
                <div className="mt-2 text-sm text-emerald-900">
                  R² = {fmt(regression.rSquared, 4)}{" "}
                  <span className="text-xs text-emerald-700">
                    (
                    {regression.rSquared >= 0.9
                      ? "ความสัมพันธ์เชิงเส้นสูงมาก"
                      : regression.rSquared >= 0.7
                        ? "ความสัมพันธ์เชิงเส้นค่อนข้างสูง"
                        : regression.rSquared >= 0.4
                          ? "ความสัมพันธ์เชิงเส้นปานกลาง"
                          : "ความสัมพันธ์เชิงเส้นต่ำ"}
                    )
                  </span>
                </div>
              </div>
              <div className="rounded-md bg-slate-50 p-3 text-xs text-slate-500">
                Slope (m) = {fmt(regression.slope, 6)} · Intercept (b) ={" "}
                {fmt(regression.intercept, 6)} · n = {regression.n}
              </div>
            </>
          ) : (
            <p className="text-sm text-red-600">
              ต้องมีข้อมูล X, Y จำนวนเท่ากัน อย่างน้อย 2 คู่ และค่า X ต้องไม่เท่ากันทั้งหมด
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
