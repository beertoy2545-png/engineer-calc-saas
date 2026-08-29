// Pump head/power sizing and NPSH (cavitation) check.
// Method and reference data sourced from ME444 Engineering Piping System
// Design course material (Thammasat University), Chapter 6 - Pump:
//   Fluid power:  E_fluid = Q * dP                      (eq. 6.1)
//   Shaft power:  E_shaft = Q * dP / eta_pump            (eq. 6.2)
//   NPSHA:        NPSHA = p_atm - (z + p_vapor + hL_suction)   (eq. 6.8)
//
// Verified against the book's worked Example 6.1 (DN80 steel, 600 lpm,
// 30°C water, site altitude 1000 m, z = 4 m.WA., suction length 18 m,
// +50% minor-loss margin) which gives NPSHA = 3.195 m.WA. — this module's
// Darcy-Weisbach suction-loss calc reproduces the book's chart-based
// friction value (5.67 m/100m) to within ~2%.
//
// Design-aid tool only — not a substitute for pump datasheet NPSHR and
// review by a licensed mechanical engineer before installation.

import {
  GRAVITY,
  PIPE_SIZE_TABLES,
  ROUGHNESS_MM,
  singlePipeHeadLoss,
  waterPropertiesAt,
  type PipeMaterial,
} from "./pipeSizing";

export { PIPE_SIZE_TABLES, ROUGHNESS_MM };
export type { PipeMaterial };

// Altitude (m) -> atmospheric pressure (m.WA.)
const ALTITUDE_M = [-1000, -800, -600, -400, -200, 0, 200, 400, 600, 800, 1000, 1200, 1400, 1600, 1800, 2000];
const PATM_MWA = [11.61, 11.34, 11.08, 10.83, 10.57, 10.33, 10.08, 9.85, 9.61, 9.38, 9.16, 8.94, 8.72, 8.51, 8.3, 8.09];

// Water temperature (°C) -> vapor pressure (m.WA.)
const VAPOR_TEMP_C = [0, 5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
const PVAPOR_MWA = [0.089, 0.094, 0.12, 0.233, 0.435, 0.757, 1.26, 2.03, 3.17, 4.82, 7.15, 10.33];

function interpolate(x: number, xs: number[], ys: number[]): number {
  const clamped = Math.min(Math.max(x, xs[0]), xs[xs.length - 1]);
  for (let i = 0; i < xs.length - 1; i++) {
    if (clamped >= xs[i] && clamped <= xs[i + 1]) {
      const t = (clamped - xs[i]) / (xs[i + 1] - xs[i]);
      return ys[i] + t * (ys[i + 1] - ys[i]);
    }
  }
  return ys[ys.length - 1];
}

export function atmPressureAtAltitude(altitudeM: number) {
  return interpolate(altitudeM, ALTITUDE_M, PATM_MWA);
}

export function vaporPressureAtTemp(tempC: number) {
  return interpolate(tempC, VAPOR_TEMP_C, PVAPOR_MWA);
}

// Standard IEC motor power ratings (kW)
export const STANDARD_MOTOR_KW = [
  0.37, 0.55, 0.75, 1.1, 1.5, 2.2, 3, 4, 5.5, 7.5, 11, 15, 18.5, 22, 30, 37,
  45, 55, 75, 90, 110, 132, 150,
];

export interface PumpHeadPowerInput {
  flowRateLpm: number;
  staticHeadM: number;
  frictionHeadLossM: number;
  waterTempC: number;
  designMarginPct: number;
  pumpEfficiencyPct: number;
  motorEfficiencyPct: number;
}

export interface PumpHeadPowerResult {
  tdhM: number;
  tdhWithMarginM: number;
  fluidPowerKw: number;
  shaftPowerKw: number;
  motorInputPowerKw: number;
  recommendedMotorKw: number;
}

export function calculatePumpHeadPower(
  input: PumpHeadPowerInput,
): PumpHeadPowerResult {
  const { rho } = waterPropertiesAt(input.waterTempC);
  const tdhM = input.staticHeadM + input.frictionHeadLossM;
  const tdhWithMarginM = tdhM * (1 + input.designMarginPct / 100);

  const qM3s = input.flowRateLpm / 60000;
  const deltaPPa = rho * GRAVITY * tdhWithMarginM;

  const fluidPowerW = qM3s * deltaPPa; // eq. 6.1
  const shaftPowerW = fluidPowerW / (input.pumpEfficiencyPct / 100); // eq. 6.2
  const motorInputPowerW = shaftPowerW / (input.motorEfficiencyPct / 100);

  const motorInputPowerKw = motorInputPowerW / 1000;
  const recommendedMotorKw =
    STANDARD_MOTOR_KW.find((kw) => kw >= motorInputPowerKw) ??
    STANDARD_MOTOR_KW[STANDARD_MOTOR_KW.length - 1];

  return {
    tdhM,
    tdhWithMarginM,
    fluidPowerKw: fluidPowerW / 1000,
    shaftPowerKw: shaftPowerW / 1000,
    motorInputPowerKw,
    recommendedMotorKw,
  };
}

export interface NpshInput {
  siteAltitudeM: number;
  waterTempC: number;
  suctionStaticLiftM: number; // z: positive = pump above source (suction lift)
  suctionMaterial: PipeMaterial;
  suctionPipeIdMm: number;
  suctionLengthM: number;
  suctionFlowLpm: number;
  minorLossMarginPct: number; // simple blanket margin on major loss, matches book method (e.g. +50%)
  npshRequiredM: number;
}

export interface NpshResult {
  atmPressureM: number;
  vaporPressureM: number;
  suctionVelocityMs: number;
  suctionMajorLossM: number;
  suctionHeadLossM: number;
  npshAvailableM: number;
  hasCavitationRisk: boolean;
  marginM: number;
}

export function calculateNpsh(input: NpshInput): NpshResult {
  const { nu } = waterPropertiesAt(input.waterTempC);
  const roughnessMm = ROUGHNESS_MM[input.suctionMaterial];

  const loss = singlePipeHeadLoss({
    idMm: input.suctionPipeIdMm,
    roughnessMm,
    lengthM: input.suctionLengthM,
    flowLpm: input.suctionFlowLpm,
    totalK: 0,
    nu,
  });

  const suctionHeadLossM = loss.majorLossM * (1 + input.minorLossMarginPct / 100);

  const atmPressureM = atmPressureAtAltitude(input.siteAltitudeM);
  const vaporPressureM = vaporPressureAtTemp(input.waterTempC);

  const npshAvailableM =
    atmPressureM -
    (input.suctionStaticLiftM + vaporPressureM + suctionHeadLossM);

  return {
    atmPressureM,
    vaporPressureM,
    suctionVelocityMs: loss.velocityMs,
    suctionMajorLossM: loss.majorLossM,
    suctionHeadLossM,
    npshAvailableM,
    hasCavitationRisk: npshAvailableM < input.npshRequiredM,
    marginM: npshAvailableM - input.npshRequiredM,
  };
}
