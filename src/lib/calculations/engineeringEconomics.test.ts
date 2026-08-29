import { describe, expect, it } from "vitest";
import {
  calculateBreakEven,
  calculateCashFlowAnalysis,
} from "./engineeringEconomics";

describe("calculateCashFlowAnalysis", () => {
  // Hand-calculated: initial investment 100,000; CFs 30k/35k/40k/45k; r=10%
  it("matches a hand-calculated NPV and payback case", () => {
    const result = calculateCashFlowAnalysis({
      initialInvestment: 100000,
      annualCashFlows: [30000, 35000, 40000, 45000],
      discountRatePct: 10,
    });

    expect(result.npv).toBeCloseTo(16986.81, 0);
    expect(result.simplePaybackYears).toBeCloseTo(2.875, 3);
    expect(result.discountedPaybackYears).toBeCloseTo(3.4473, 3);
  });

  it("finds an IRR where NPV is (numerically) zero", () => {
    const result = calculateCashFlowAnalysis({
      initialInvestment: 100000,
      annualCashFlows: [30000, 35000, 40000, 45000],
      discountRatePct: 10,
    });
    expect(result.irrPct).not.toBeNull();
    // IRR should be a bit above the 15-20% bracket found by hand-interpolation
    expect(result.irrPct!).toBeGreaterThan(15);
    expect(result.irrPct!).toBeLessThan(20);

    // The defining property of IRR: NPV at that rate is ~0
    const npvAtIrr = calculateCashFlowAnalysis({
      initialInvestment: 100000,
      annualCashFlows: [30000, 35000, 40000, 45000],
      discountRatePct: result.irrPct!,
    }).npv;
    expect(npvAtIrr).toBeCloseTo(0, 1);
  });

  it("returns null payback when the investment never pays back", () => {
    const result = calculateCashFlowAnalysis({
      initialInvestment: 100000,
      annualCashFlows: [10000, 10000, 10000],
      discountRatePct: 10,
    });
    expect(result.simplePaybackYears).toBeNull();
    expect(result.npv).toBeLessThan(0);
  });

  it("gives a positive NPV a preference over a lower one at the same rate", () => {
    const better = calculateCashFlowAnalysis({
      initialInvestment: 50000,
      annualCashFlows: [20000, 20000, 20000],
      discountRatePct: 8,
    });
    const worse = calculateCashFlowAnalysis({
      initialInvestment: 50000,
      annualCashFlows: [15000, 15000, 15000],
      discountRatePct: 8,
    });
    expect(better.npv).toBeGreaterThan(worse.npv);
  });
});

describe("calculateBreakEven", () => {
  it("matches a hand-calculated case", () => {
    const result = calculateBreakEven({
      fixedCost: 50000,
      pricePerUnit: 25,
      variableCostPerUnit: 15,
    });
    expect(result.contributionMarginPerUnit).toBe(10);
    expect(result.breakEvenUnits).toBeCloseTo(5000, 6);
    expect(result.breakEvenRevenue).toBeCloseTo(125000, 6);
  });

  it("returns null when the unit contribution margin is not positive", () => {
    const result = calculateBreakEven({
      fixedCost: 50000,
      pricePerUnit: 10,
      variableCostPerUnit: 15, // selling below variable cost
    });
    expect(result.breakEvenUnits).toBeNull();
  });
});
