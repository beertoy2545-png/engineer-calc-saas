// Engineering Economics: project cash-flow analysis (NPV, IRR, payback
// period) — Industrial Engineering, but applicable across every discipline
// for evaluating whether a designed system is worth building. Standard
// time-value-of-money formulas, universal (not textbook-dependent).
//
//   NPV(r) = -InitialInvestment + sum_{t=1..n} CF_t / (1+r)^t
//   IRR    = the rate r where NPV(r) = 0 (solved numerically via bisection,
//            assumes a conventional cash flow: one sign change from
//            negative to positive)
//   Simple payback period    = year cumulative (undiscounted) CF turns positive,
//                               interpolated within that year
//   Discounted payback period = same, using discounted cash flows

export interface CashFlowInput {
  initialInvestment: number; // positive number, the up-front outflow
  annualCashFlows: number[]; // CF_1 .. CF_n
  discountRatePct: number;
}

export interface CashFlowResult {
  npv: number;
  irrPct: number | null; // null if no sign change found in search range
  simplePaybackYears: number | null; // null if never pays back
  discountedPaybackYears: number | null;
  cumulativeCashFlows: number[];
  cumulativeDiscountedCashFlows: number[];
}

function npvAtRate(
  initialInvestment: number,
  annualCashFlows: number[],
  ratePct: number,
): number {
  const r = ratePct / 100;
  let npv = -initialInvestment;
  annualCashFlows.forEach((cf, i) => {
    npv += cf / Math.pow(1 + r, i + 1);
  });
  return npv;
}

function solveIrr(initialInvestment: number, annualCashFlows: number[]): number | null {
  // Bisection over a wide, practical rate range (-99% to 1000%).
  let lo = -99;
  let hi = 1000;
  let npvLo = npvAtRate(initialInvestment, annualCashFlows, lo);
  let npvHi = npvAtRate(initialInvestment, annualCashFlows, hi);

  if (npvLo === 0) return lo;
  if (npvHi === 0) return hi;
  if (Math.sign(npvLo) === Math.sign(npvHi)) return null; // no sign change in range

  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    const npvMid = npvAtRate(initialInvestment, annualCashFlows, mid);
    if (Math.abs(npvMid) < 1e-6) return mid;
    if (Math.sign(npvMid) === Math.sign(npvLo)) {
      lo = mid;
      npvLo = npvMid;
    } else {
      hi = mid;
      npvHi = npvMid;
    }
  }
  return (lo + hi) / 2;
}

function paybackFromCumulative(cumulative: number[]): number | null {
  for (let i = 0; i < cumulative.length; i++) {
    if (cumulative[i] >= 0) {
      const prevCum = i === 0 ? -Infinity : cumulative[i - 1];
      if (prevCum >= 0) return i; // already paid back before this year started (edge case)
      const cfThisYear = cumulative[i] - prevCum;
      const fractionIntoYear = cfThisYear !== 0 ? -prevCum / cfThisYear : 0;
      return i + fractionIntoYear;
    }
  }
  return null;
}

export function calculateCashFlowAnalysis(input: CashFlowInput): CashFlowResult {
  const r = input.discountRatePct / 100;

  const cumulativeCashFlows: number[] = [];
  let running = -input.initialInvestment;
  input.annualCashFlows.forEach((cf) => {
    running += cf;
    cumulativeCashFlows.push(running);
  });

  const cumulativeDiscountedCashFlows: number[] = [];
  let runningDisc = -input.initialInvestment;
  input.annualCashFlows.forEach((cf, i) => {
    runningDisc += cf / Math.pow(1 + r, i + 1);
    cumulativeDiscountedCashFlows.push(runningDisc);
  });

  const npv = npvAtRate(input.initialInvestment, input.annualCashFlows, input.discountRatePct);
  const irrPct = solveIrr(input.initialInvestment, input.annualCashFlows);

  return {
    npv,
    irrPct,
    simplePaybackYears: paybackFromCumulative(cumulativeCashFlows),
    discountedPaybackYears: paybackFromCumulative(cumulativeDiscountedCashFlows),
    cumulativeCashFlows,
    cumulativeDiscountedCashFlows,
  };
}

export interface BreakEvenInput {
  fixedCost: number;
  pricePerUnit: number;
  variableCostPerUnit: number;
}

export interface BreakEvenResult {
  contributionMarginPerUnit: number;
  breakEvenUnits: number | null;
  breakEvenRevenue: number | null;
}

export function calculateBreakEven(input: BreakEvenInput): BreakEvenResult {
  const contributionMarginPerUnit = input.pricePerUnit - input.variableCostPerUnit;
  if (contributionMarginPerUnit <= 0) {
    return { contributionMarginPerUnit, breakEvenUnits: null, breakEvenRevenue: null };
  }
  const breakEvenUnits = input.fixedCost / contributionMarginPerUnit;
  return {
    contributionMarginPerUnit,
    breakEvenUnits,
    breakEvenRevenue: breakEvenUnits * input.pricePerUnit,
  };
}
