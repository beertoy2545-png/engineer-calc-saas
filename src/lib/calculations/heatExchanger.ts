// Heat exchanger sizing via the LMTD (Log Mean Temperature Difference)
// method — standard chemical/process/mechanical engineering heat-transfer
// equipment design method. Formulas and typical U-value ranges cross-
// checked via web search against independent heat-transfer references
// before implementation.
//
// Counterflow:   dT1 = Th_in - Tc_out    dT2 = Th_out - Tc_in
// Parallel flow: dT1 = Th_in - Tc_in     dT2 = Th_out - Tc_out
// LMTD = (dT1 - dT2) / ln(dT1 / dT2)     (-> dT1 as dT1 -> dT2, L'Hopital)
//
// Design equation: Q = U * A * LMTD  =>  A = Q / (U * LMTD)
//
// This is the basic LMTD method for a single counterflow/parallel-flow
// exchanger only — it does not include the F correction factor needed for
// multi-pass shell-and-tube or crossflow arrangements, and does not check
// fluid property limits, fouling factors, or pressure drop.
// Design-aid tool only — final heat exchanger selection/sizing must be
// reviewed by a licensed mechanical/process engineer against manufacturer
// data.

export type FlowArrangement = "counterflow" | "parallel";

export interface UValuePreset {
  key: string;
  label: string;
  uWm2k: number;
}

export const U_VALUE_PRESETS: UValuePreset[] = [
  { key: "waterWater", label: "น้ำ-น้ำ (1,000–4,000 W/m²K)", uWm2k: 2000 },
  { key: "oilWater", label: "น้ำมัน-น้ำ (200–800 W/m²K)", uWm2k: 500 },
  { key: "steamCondenser", label: "ไอน้ำควบแน่น-น้ำ (1,500–3,500 W/m²K)", uWm2k: 2500 },
  { key: "gasWater", label: "แก๊ส-น้ำ (10–50 W/m²K)", uWm2k: 30 },
  { key: "gasGas", label: "แก๊ส-แก๊ส (~20 W/m²K)", uWm2k: 20 },
  { key: "custom", label: "กำหนดเอง (Custom)", uWm2k: 500 },
];

export interface HeatExchangerInput {
  flowArrangement: FlowArrangement;
  thInC: number;
  thOutC: number;
  tcInC: number;
  tcOutC: number;
  heatDutyKw: number;
  overallUWm2k: number;
}

export interface HeatExchangerResult {
  deltaT1: number;
  deltaT2: number;
  lmtdC: number;
  requiredAreaM2: number;
  isThermodynamicallyValid: boolean;
}

export function calculateHeatExchanger(input: HeatExchangerInput): HeatExchangerResult {
  const deltaT1 =
    input.flowArrangement === "counterflow"
      ? input.thInC - input.tcOutC
      : input.thInC - input.tcInC;
  const deltaT2 =
    input.flowArrangement === "counterflow"
      ? input.thOutC - input.tcInC
      : input.thOutC - input.tcOutC;

  const isThermodynamicallyValid =
    input.thInC > input.thOutC &&
    input.tcOutC > input.tcInC &&
    deltaT1 > 0 &&
    deltaT2 > 0;

  let lmtdC: number;
  if (!isThermodynamicallyValid) {
    lmtdC = NaN;
  } else if (Math.abs(deltaT1 - deltaT2) < 1e-6) {
    lmtdC = deltaT1; // limiting case, dT1 == dT2
  } else {
    lmtdC = (deltaT1 - deltaT2) / Math.log(deltaT1 / deltaT2);
  }

  const requiredAreaM2 = isThermodynamicallyValid
    ? (input.heatDutyKw * 1000) / (input.overallUWm2k * lmtdC)
    : NaN;

  return { deltaT1, deltaT2, lmtdC, requiredAreaM2, isThermodynamicallyValid };
}
