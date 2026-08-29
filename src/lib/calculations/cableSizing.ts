// Electrical cable sizing and voltage-drop calculator.
// Source: IEC 60364-5-52 (Electrical installations of buildings — Selection
// and erection of electrical equipment — Wiring systems), the international
// standard for low-voltage cable sizing.
//
// Current-carrying capacity table: Table B.52.2 — PVC insulation (70°C max
// conductor temperature), copper conductors, 2 loaded conductors, reference
// ambient 30°C in air / 20°C in ground.
// Ambient temperature correction: Table B.52.14 (PVC column).
// Grouping (bunching) correction: Table B.52.17.
//
// Voltage drop is computed from first-principles conductor resistance
// (rho_copper(T) / A) rather than the standard's tabulated mV/A/m values,
// which were not fully available at build time — this omits the cable
// reactance (X) term, a reasonable approximation for conductors up to
// roughly 95 mm^2 but increasingly inexact for very large conductors.
//
// XLPE (90°C) insulation is NOT included — the full XLPE current-rating
// table across installation methods could not be verified from source at
// build time, so it was left out rather than guessed.
//
// Design-aid tool only — final cable selection must be reviewed by a
// licensed electrical engineer against the applicable local wiring code.

export type InstallMethod = "A1" | "A2" | "B1" | "B2" | "C" | "E" | "F";

export const INSTALL_METHOD_LABEL: Record<InstallMethod, string> = {
  A1: "A1 — สายในท่อร้อยสายฝังผนังฉนวนความร้อน",
  A2: "A2 — สายหลายแกนในท่อร้อยสายฝังผนังฉนวนความร้อน",
  B1: "B1 — สายเดี่ยวในท่อร้อยสายบนผนัง",
  B2: "B2 — สายหลายแกนในท่อร้อยสายบนผนัง",
  C: "C — สายเดินติดผนังโดยตรง (Clipped direct)",
  E: "E — สายหลายแกนในอากาศ (Cable tray/ladder)",
  F: "F — สายเดี่ยวเรียงชิดในอากาศ",
};

const CABLE_SIZES_MM2 = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240];

// Table B.52.2 — PVC insulation, copper, 2 loaded conductors (amps)
const CURRENT_RATING_A: Record<InstallMethod, number[]> = {
  A1: [14.5, 19.5, 26, 34, 46, 61, 80, 99, 119, 151, 182, 210, 240, 273, 320],
  A2: [14, 18.5, 25, 32, 43, 57, 75, 92, 110, 139, 167, 192, 219, 248, 291],
  B1: [17.5, 24, 32, 41, 57, 76, 101, 125, 151, 192, 232, 269, 300, 341, 400],
  B2: [16.5, 23, 30, 38, 52, 69, 90, 111, 133, 168, 201, 232, 258, 294, 344],
  C: [19.5, 27, 36, 46, 63, 85, 112, 138, 168, 213, 258, 299, 344, 392, 461],
  E: [22, 30, 40, 51, 70, 94, 119, 148, 180, 232, 282, 328, 379, 434, 514],
  F: [24, 33, 45, 57, 76, 101, 131, 162, 196, 251, 304, 352, 406, 463, 546],
};

// Table B.52.14 — ambient air temperature correction factor (PVC column)
const AMBIENT_TEMP_C = [10, 15, 20, 25, 30, 35, 40, 45, 50];
const AMBIENT_FACTOR_PVC = [1.22, 1.17, 1.12, 1.06, 1.0, 0.94, 0.87, 0.79, 0.71];

// Table B.52.17 — grouping (bunching) reduction factor
const GROUPING_CIRCUITS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 12, 16, 20];
const GROUPING_FACTOR = [1.0, 0.8, 0.7, 0.65, 0.6, 0.57, 0.54, 0.52, 0.5, 0.45, 0.41, 0.38];

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

export function ambientTempFactor(tempC: number): number {
  return interpolate(tempC, AMBIENT_TEMP_C, AMBIENT_FACTOR_PVC);
}

export function groupingFactor(circuits: number): number {
  return interpolate(circuits, GROUPING_CIRCUITS, GROUPING_FACTOR);
}

const COPPER_RESISTIVITY_20C = 1 / 58; // Ohm.mm2/m (IACS 100%)
const COPPER_TEMP_COEFF = 0.00393; // per degC
const PVC_CONDUCTOR_TEMP_C = 70;

function copperResistanceOhmPerM(crossSectionMm2: number): number {
  const rho = COPPER_RESISTIVITY_20C * (1 + COPPER_TEMP_COEFF * (PVC_CONDUCTOR_TEMP_C - 20));
  return rho / crossSectionMm2;
}

export type Phase = "single" | "three";

export interface CableSizingInput {
  phase: Phase;
  loadPowerKw: number;
  voltageV: number;
  powerFactor: number;
  installMethod: InstallMethod;
  ambientTempC: number;
  groupedCircuits: number;
  lengthM: number;
  maxVoltageDropPct: number;
}

export interface CableSizeResult {
  crossSectionMm2: number;
  ratedCurrentA: number;
  deratedCurrentA: number;
  ampacityOk: boolean;
  voltageDropV: number;
  voltageDropPct: number;
  voltageDropOk: boolean;
  suitable: boolean;
}

export interface CableSizingOutput {
  designCurrentA: number;
  ambientFactor: number;
  groupFactor: number;
  results: CableSizeResult[];
  recommendedIndex: number;
}

export function calculateCableSizing(input: CableSizingInput): CableSizingOutput {
  const designCurrentA =
    input.phase === "three"
      ? (input.loadPowerKw * 1000) / (Math.sqrt(3) * input.voltageV * input.powerFactor)
      : (input.loadPowerKw * 1000) / (input.voltageV * input.powerFactor);

  const ambientFactor = ambientTempFactor(input.ambientTempC);
  const groupFactor = groupingFactor(input.groupedCircuits);

  const ratings = CURRENT_RATING_A[input.installMethod];
  const phaseVoltageFactor = input.phase === "three" ? Math.sqrt(3) : 2;

  const results: CableSizeResult[] = CABLE_SIZES_MM2.map((size, i) => {
    const ratedCurrentA = ratings[i];
    const deratedCurrentA = ratedCurrentA * ambientFactor * groupFactor;
    const ampacityOk = deratedCurrentA >= designCurrentA;

    const rOhmPerM = copperResistanceOhmPerM(size);
    const voltageDropV =
      phaseVoltageFactor * designCurrentA * rOhmPerM * input.lengthM * input.powerFactor;
    const voltageDropPct = (voltageDropV / input.voltageV) * 100;
    const voltageDropOk = voltageDropPct <= input.maxVoltageDropPct;

    return {
      crossSectionMm2: size,
      ratedCurrentA,
      deratedCurrentA,
      ampacityOk,
      voltageDropV,
      voltageDropPct,
      voltageDropOk,
      suitable: ampacityOk && voltageDropOk,
    };
  });

  let recommendedIndex = results.findIndex((r) => r.suitable);
  if (recommendedIndex === -1) {
    recommendedIndex = results.findIndex((r) => r.ampacityOk);
  }
  if (recommendedIndex === -1) recommendedIndex = results.length - 1;

  return { designCurrentA, ambientFactor, groupFactor, results, recommendedIndex };
}
