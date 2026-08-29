"use client";

import { useMemo, useState } from "react";
import {
  calculateBreakEven,
  calculateCashFlowAnalysis,
} from "@/lib/calculations/engineeringEconomics";
import { parseNumberList } from "@/lib/calculations/statistics";
import { NumberField } from "@/components/ui/NumberField";
import { WarningBanner } from "@/components/ui/WarningBanner";
import { fmt } from "@/lib/format";

export default function EngineeringEconomicsCalculator() {
  const [initialInvestment, setInitialInvestment] = useState(100000);
  const [cashFlowsText, setCashFlowsText] = useState("30000, 35000, 40000, 45000");
  const [discountRatePct, setDiscountRatePct] = useState(10);

  const annualCashFlows = useMemo(() => parseNumberList(cashFlowsText), [cashFlowsText]);
  const cashFlowResult = useMemo(
    () =>
      annualCashFlows.length > 0
        ? calculateCashFlowAnalysis({ initialInvestment, annualCashFlows, discountRatePct })
        : null,
    [initialInvestment, annualCashFlows, discountRatePct],
  );

  const [fixedCost, setFixedCost] = useState(50000);
  const [pricePerUnit, setPricePerUnit] = useState(25);
  const [variableCostPerUnit, setVariableCostPerUnit] = useState(15);
  const breakEven = useMemo(
    () => calculateBreakEven({ fixedCost, pricePerUnit, variableCostPerUnit }),
    [fixedCost, pricePerUnit, variableCostPerUnit],
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-slate-900">
        เศรษฐศาสตร์วิศวกรรม (Engineering Economics)
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        ประเมินความคุ้มค่าโครงการ — NPV, IRR, Payback Period และจุดคุ้มทุน (Break-Even)
        ใช้ได้กับทุกสาขาวิศวกรรม
      </p>

      <WarningBanner>
        ⚠️ ใช้สำหรับประเมินเบื้องต้นเท่านั้น ไม่รวมภาษี ค่าเสื่อมราคา อัตราเงินเฟ้อ หรือ
        ความเสี่ยง/ความไม่แน่นอนของกระแสเงินสดในอนาคต
      </WarningBanner>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Cash flow analysis */}
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-medium text-slate-900">
            วิเคราะห์กระแสเงินสด (NPV / IRR / Payback)
          </h2>
          <NumberField
            label="เงินลงทุนเริ่มต้น"
            unit="บาท"
            value={initialInvestment}
            onChange={setInitialInvestment}
          />
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-slate-700">
              กระแสเงินสดรายปี (ปีที่ 1, 2, 3, ... คั่นด้วยลูกน้ำ)
            </span>
            <textarea
              className="h-20 rounded-md border border-slate-300 px-3 py-2 font-mono text-sm text-slate-900"
              value={cashFlowsText}
              onChange={(e) => setCashFlowsText(e.target.value)}
            />
          </label>
          <NumberField
            label="อัตราคิดลด (Discount Rate)"
            unit="%"
            value={discountRatePct}
            step={0.5}
            onChange={setDiscountRatePct}
          />

          {cashFlowResult && (
            <>
              <div
                className={`rounded-lg border p-4 ${
                  cashFlowResult.npv >= 0
                    ? "border-emerald-300 bg-emerald-50"
                    : "border-red-300 bg-red-50"
                }`}
              >
                <div
                  className={
                    cashFlowResult.npv >= 0 ? "text-sm text-emerald-800" : "text-sm text-red-800"
                  }
                >
                  NPV (มูลค่าปัจจุบันสุทธิ)
                </div>
                <div
                  className={`text-2xl font-semibold ${
                    cashFlowResult.npv >= 0 ? "text-emerald-900" : "text-red-900"
                  }`}
                >
                  {fmt(cashFlowResult.npv, 0)} บาท
                </div>
                <div className="mt-1 text-xs">
                  {cashFlowResult.npv >= 0
                    ? "NPV > 0 → โครงการคุ้มค่าที่อัตราคิดลดนี้"
                    : "NPV < 0 → โครงการไม่คุ้มค่าที่อัตราคิดลดนี้"}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 text-sm text-slate-600 sm:grid-cols-3">
                <div className="rounded-md bg-slate-50 p-3">
                  <div className="text-xs text-slate-500">IRR</div>
                  <div className="font-medium text-slate-900">
                    {cashFlowResult.irrPct !== null ? `${fmt(cashFlowResult.irrPct, 2)}%` : "ไม่พบ"}
                  </div>
                </div>
                <div className="rounded-md bg-slate-50 p-3">
                  <div className="text-xs text-slate-500">Simple Payback</div>
                  <div className="font-medium text-slate-900">
                    {cashFlowResult.simplePaybackYears !== null
                      ? `${fmt(cashFlowResult.simplePaybackYears, 2)} ปี`
                      : "ไม่คืนทุน"}
                  </div>
                </div>
                <div className="rounded-md bg-slate-50 p-3">
                  <div className="text-xs text-slate-500">Discounted Payback</div>
                  <div className="font-medium text-slate-900">
                    {cashFlowResult.discountedPaybackYears !== null
                      ? `${fmt(cashFlowResult.discountedPaybackYears, 2)} ปี`
                      : "ไม่คืนทุน"}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Break-even analysis */}
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-medium text-slate-900">จุดคุ้มทุน (Break-Even Analysis)</h2>
          <NumberField
            label="ต้นทุนคงที่ (Fixed Cost)"
            unit="บาท"
            value={fixedCost}
            onChange={setFixedCost}
          />
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label="ราคาขายต่อหน่วย"
              unit="บาท"
              value={pricePerUnit}
              onChange={setPricePerUnit}
            />
            <NumberField
              label="ต้นทุนผันแปรต่อหน่วย"
              unit="บาท"
              value={variableCostPerUnit}
              onChange={setVariableCostPerUnit}
            />
          </div>

          {breakEven.breakEvenUnits !== null ? (
            <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-4">
              <div className="text-sm text-emerald-800">จุดคุ้มทุน</div>
              <div className="text-2xl font-semibold text-emerald-900">
                {fmt(breakEven.breakEvenUnits, 0)} หน่วย
              </div>
              <div className="mt-1 text-xs text-emerald-800">
                = {fmt(breakEven.breakEvenRevenue!, 0)} บาท (รายได้ที่จุดคุ้มทุน)
              </div>
              <div className="mt-1 text-xs text-emerald-700">
                กำไรส่วนเกินต่อหน่วย (Contribution Margin) ={" "}
                {fmt(breakEven.contributionMarginPerUnit, 2)} บาท
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-800">
              ⚠️ ราคาขายต่อหน่วยต่ำกว่าหรือเท่ากับต้นทุนผันแปร — ไม่มีจุดคุ้มทุน
              (ขาดทุนทุกหน่วยที่ขาย)
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
