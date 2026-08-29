// Sedimentation tank (clarifier) sizing check for water/wastewater
// treatment — Environmental Engineering. Design criteria (typical SOR
// ranges, max weir loading) sourced from Metcalf & Eddy via web search
// and cross-checked against independent references before implementation.
//
//   SOR (Surface Overflow Rate) = Q / A            [m3/m2.day]
//   HRT (Hydraulic Retention Time) = (A*depth)/Q*24  [hours]
//   Weir loading rate = Q / weir length             [m3/day per m]
//
// Typical design ranges (average daily flow):
//   Primary clarifier SOR:   32-48 m3/m2.day (peak up to 80-120), HRT 1.5-2.5 hr
//   Secondary (activated sludge) clarifier SOR: 24-49 m3/m2.day (peak up to ~122)
//   Max weir loading (primary): ~190 m3/day per m of weir length
//
// This checks a proposed tank geometry against typical published design
// ranges — it does not perform a full solids-flux analysis, does not
// account for sludge blanket depth, storm peaking beyond a simple
// multiplier, or specific effluent quality/flocculation characteristics.
// Design-aid tool only — final clarifier sizing must be reviewed by a
// licensed environmental/civil engineer.

export type ClarifierType = "primary" | "secondary";
export type TankShape = "circular" | "rectangular";

export interface SorRange {
  minM3M2Day: number;
  maxM3M2Day: number;
  peakMaxM3M2Day: number;
}

export const SOR_CRITERIA: Record<ClarifierType, SorRange> = {
  primary: { minM3M2Day: 32, maxM3M2Day: 48, peakMaxM3M2Day: 120 },
  secondary: { minM3M2Day: 24, maxM3M2Day: 49, peakMaxM3M2Day: 122 },
};

export const HRT_RANGE_HOURS = { min: 1.5, max: 2.5 };
export const MAX_WEIR_LOADING_M3_DAY_PER_M = 190;

export interface ClarifierInput {
  clarifierType: ClarifierType;
  avgFlowM3Day: number;
  peakingFactor: number;
  shape: TankShape;
  diameterM?: number; // circular
  lengthM?: number; // rectangular
  widthM?: number; // rectangular
  depthM: number;
}

export interface ClarifierResult {
  areaM2: number;
  weirLengthM: number;
  volumeM3: number;
  sorM3M2Day: number;
  peakSorM3M2Day: number;
  hrtHours: number;
  weirLoadingM3DayPerM: number;
  isSorInRange: boolean;
  isPeakSorOk: boolean;
  isHrtInRange: boolean;
  isWeirLoadingOk: boolean;
  recommendedAreaMinM2: number;
  recommendedAreaMaxM2: number;
}

export function calculateClarifierDesign(input: ClarifierInput): ClarifierResult {
  const criteria = SOR_CRITERIA[input.clarifierType];

  let areaM2: number;
  let weirLengthM: number;
  if (input.shape === "circular") {
    const d = input.diameterM ?? 0;
    areaM2 = (Math.PI * d * d) / 4;
    weirLengthM = Math.PI * d; // peripheral weir, typical for circular clarifiers
  } else {
    const l = input.lengthM ?? 0;
    const w = input.widthM ?? 0;
    areaM2 = l * w;
    weirLengthM = w; // simplified: single straight effluent weir across the width
  }

  const volumeM3 = areaM2 * input.depthM;
  const sorM3M2Day = input.avgFlowM3Day / areaM2;
  const peakSorM3M2Day = sorM3M2Day * input.peakingFactor;
  const hrtHours = (volumeM3 / input.avgFlowM3Day) * 24;
  const weirLoadingM3DayPerM = input.avgFlowM3Day / weirLengthM;

  return {
    areaM2,
    weirLengthM,
    volumeM3,
    sorM3M2Day,
    peakSorM3M2Day,
    hrtHours,
    weirLoadingM3DayPerM,
    isSorInRange:
      sorM3M2Day >= criteria.minM3M2Day && sorM3M2Day <= criteria.maxM3M2Day,
    isPeakSorOk: peakSorM3M2Day <= criteria.peakMaxM3M2Day,
    isHrtInRange: hrtHours >= HRT_RANGE_HOURS.min && hrtHours <= HRT_RANGE_HOURS.max,
    isWeirLoadingOk: weirLoadingM3DayPerM <= MAX_WEIR_LOADING_M3_DAY_PER_M,
    recommendedAreaMinM2: input.avgFlowM3Day / criteria.maxM3M2Day,
    recommendedAreaMaxM2: input.avgFlowM3Day / criteria.minM3M2Day,
  };
}
