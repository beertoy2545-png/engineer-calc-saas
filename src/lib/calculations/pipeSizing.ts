// Pipe sizing calculator for water piping systems.
// Method and reference data sourced from ME444 Engineering Piping System
// Design course material (Thammasat University): Chap04 - Theory of Flow,
// Chap05 - Pipe Sizing, and the course's calculation-tables reference.
//
// Core equations:
//   Continuity:        Q = A * v
//   Reynolds number:   Re = v * D / nu
//   Friction factor:   laminar   f = 64 / Re            (Re < 2300)
//                       turbulent f = Swamee-Jain approx. of Colebrook
//   Major loss:         hf = f * (L/D) * (v^2 / 2g)       (Darcy-Weisbach)
//   Minor loss:         hm = sum(K_i) * (v^2 / 2g)
//
// This is a design-aid tool, not a substitute for review by a licensed
// mechanical/piping engineer before construction use.

export const GRAVITY = 9.81;

export type PipeMaterial = "steel" | "galvanized" | "pvc";

export interface PipeSizeSpec {
  label: string; // e.g. NPS 1", DN25
  dnMm: number;
  idMm: number;
}

// Steel SCH40 (ASME B36.10) outer/inner dimensions reused for galvanized
// steel pipe (same physical sizing standard, different roughness only).
const STEEL_SCH40: PipeSizeSpec[] = [
  { label: '1/2" (DN15)', dnMm: 15, idMm: 15.8 },
  { label: '3/4" (DN20)', dnMm: 20, idMm: 20.93 },
  { label: '1" (DN25)', dnMm: 25, idMm: 26.64 },
  { label: '1-1/4" (DN32)', dnMm: 32, idMm: 35.04 },
  { label: '1-1/2" (DN40)', dnMm: 40, idMm: 40.9 },
  { label: '2" (DN50)', dnMm: 50, idMm: 52.5 },
  { label: '2-1/2" (DN65)', dnMm: 65, idMm: 62.71 },
  { label: '3" (DN80)', dnMm: 80, idMm: 77.93 },
  { label: '4" (DN100)', dnMm: 100, idMm: 102.26 },
  { label: '6" (DN150)', dnMm: 150, idMm: 154.05 },
  { label: '8" (DN200)', dnMm: 200, idMm: 202.72 },
  { label: '10" (DN250)', dnMm: 250, idMm: 254.51 },
  { label: '12" (DN300)', dnMm: 300, idMm: 303.2 },
];

const PVC_PN10: PipeSizeSpec[] = [
  { label: "DN20", dnMm: 20, idMm: 21.2 },
  { label: "DN25", dnMm: 25, idMm: 27.2 },
  { label: "DN32", dnMm: 32, idMm: 34.0 },
  { label: "DN40", dnMm: 40, idMm: 42.6 },
  { label: "DN50", dnMm: 50, idMm: 53.6 },
  { label: "DN65", dnMm: 65, idMm: 63.8 },
  { label: "DN80", dnMm: 80, idMm: 76.6 },
  { label: "DN100", dnMm: 100, idMm: 93.8 },
  { label: "DN150", dnMm: 150, idMm: 141.0 },
  { label: "DN200", dnMm: 200, idMm: 176.2 },
];

export const PIPE_SIZE_TABLES: Record<PipeMaterial, PipeSizeSpec[]> = {
  steel: STEEL_SCH40,
  galvanized: STEEL_SCH40,
  pvc: PVC_PN10,
};

// Absolute roughness (mm)
export const ROUGHNESS_MM: Record<PipeMaterial, number> = {
  steel: 0.046, // Commercial steel / wrought iron
  galvanized: 0.15, // Galvanized iron
  pvc: 0.0015,
};

// Water properties by temperature (interpolated linearly)
const WATER_TEMP_C = [4, 10, 20, 30, 40, 50, 60, 80, 100];
const WATER_RHO = [1000.0, 999.7, 998.2, 995.7, 992.2, 988.1, 983.2, 971.8, 958.4]; // kg/m3
const WATER_MU_MPAS = [1.567, 1.307, 1.002, 0.798, 0.653, 0.548, 0.467, 0.355, 0.282]; // x1e-3 Pa.s

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

export function waterPropertiesAt(tempC: number) {
  const rho = interpolate(tempC, WATER_TEMP_C, WATER_RHO);
  const muPas = interpolate(tempC, WATER_TEMP_C, WATER_MU_MPAS) * 1e-3;
  const nu = muPas / rho;
  return { rho, muPas, nu };
}

export interface FittingOption {
  key: string;
  label: string;
  k: number;
}

export const FITTING_OPTIONS: FittingOption[] = [
  { key: "elbow90std", label: "ข้องอ 90° (Standard)", k: 0.9 },
  { key: "elbow90lr", label: "ข้องอ 90° (Long Radius)", k: 0.6 },
  { key: "elbow45", label: "ข้องอ 45°", k: 0.4 },
  { key: "teeThrough", label: "สามทาง (Flow Through)", k: 0.6 },
  { key: "teeBranch", label: "สามทาง (Branch Flow)", k: 1.8 },
  { key: "gateValve", label: "Gate Valve (เปิดสุด)", k: 0.2 },
  { key: "globeValve", label: "Globe Valve (เปิดสุด)", k: 10 },
  { key: "ballValve", label: "Ball Valve (เปิดสุด)", k: 0.1 },
  { key: "checkValve", label: "Check Valve (Swing)", k: 2.5 },
  { key: "butterflyValve", label: "Butterfly Valve (เปิดสุด)", k: 0.3 },
  { key: "strainer", label: "Strainer (Y-type)", k: 2.0 },
];

export type Application = "coldWater" | "hotWater" | "custom";

export const APPLICATION_VELOCITY_MS: Record<
  Exclude<Application, "custom">,
  { min: number; max: number }
> = {
  coldWater: { min: 1, max: 3 },
  hotWater: { min: 1, max: 2 },
};

// Recommended pressure-drop guideline for water systems (Pa/m of pipe run)
export const RECOMMENDED_PA_PER_M = { min: 100, max: 300 };

export interface PipeSizingInput {
  flowRateLpm: number;
  material: PipeMaterial;
  waterTempC: number;
  pipeLengthM: number;
  application: Application;
  customVelocityMin?: number;
  customVelocityMax?: number;
  fittingCounts: Record<string, number>;
}

export interface PipeSizeResult {
  size: PipeSizeSpec;
  velocityMs: number;
  reynolds: number;
  flowRegime: "laminar" | "transitional" | "turbulent";
  frictionFactor: number;
  majorLossM: number;
  minorLossM: number;
  totalHeadLossM: number;
  totalPressureDropPa: number;
  pressureDropPaPerM: number;
  velocityInRange: boolean;
  pressureDropInGuideline: boolean;
}

export interface PipeSizingOutput {
  rho: number;
  nu: number;
  totalK: number;
  velocityRange: { min: number; max: number };
  results: PipeSizeResult[];
  recommendedIndex: number;
}

export function frictionFactor(
  reynolds: number,
  relativeRoughness: number,
): {
  f: number;
  regime: "laminar" | "transitional" | "turbulent";
} {
  if (reynolds <= 0) return { f: 0, regime: "laminar" };
  if (reynolds < 2300) {
    return { f: 64 / reynolds, regime: "laminar" };
  }
  // Swamee-Jain explicit approximation of the Colebrook equation
  const f =
    0.25 /
    Math.pow(
      Math.log10(relativeRoughness / 3.7 + 5.74 / Math.pow(reynolds, 0.9)),
      2,
    );
  const regime = reynolds < 4000 ? "transitional" : "turbulent";
  return { f, regime };
}

export interface SinglePipeHeadLossInput {
  idMm: number;
  roughnessMm: number;
  lengthM: number;
  flowLpm: number;
  totalK: number;
  nu: number; // kinematic viscosity, m2/s
}

export interface SinglePipeHeadLossResult {
  velocityMs: number;
  reynolds: number;
  frictionFactor: number;
  flowRegime: "laminar" | "transitional" | "turbulent";
  majorLossM: number;
  minorLossM: number;
  headLossM: number;
}

// Reusable single-pipe friction calculation (Darcy-Weisbach + Swamee-Jain),
// shared by the Pipe Sizing tool and the Pump NPSH suction-line check.
export function singlePipeHeadLoss(
  input: SinglePipeHeadLossInput,
): SinglePipeHeadLossResult {
  const dM = input.idMm / 1000;
  const areaM2 = (Math.PI * dM * dM) / 4;
  const qM3s = input.flowLpm / 60000;
  const velocityMs = qM3s / areaM2;
  const reynolds = (velocityMs * dM) / input.nu;
  const relativeRoughness = input.roughnessMm / 1000 / dM;
  const { f, regime } = frictionFactor(reynolds, relativeRoughness);

  const majorLossM = f * (input.lengthM / dM) * (velocityMs ** 2 / (2 * GRAVITY));
  const minorLossM = input.totalK * (velocityMs ** 2 / (2 * GRAVITY));

  return {
    velocityMs,
    reynolds,
    frictionFactor: f,
    flowRegime: regime,
    majorLossM,
    minorLossM,
    headLossM: majorLossM + minorLossM,
  };
}

export function calculatePipeSizing(input: PipeSizingInput): PipeSizingOutput {
  const { rho, nu } = waterPropertiesAt(input.waterTempC);

  const totalK = FITTING_OPTIONS.reduce(
    (sum, opt) => sum + opt.k * (input.fittingCounts[opt.key] ?? 0),
    0,
  );

  const velocityRange =
    input.application === "custom"
      ? {
          min: input.customVelocityMin ?? 0.5,
          max: input.customVelocityMax ?? 3,
        }
      : APPLICATION_VELOCITY_MS[input.application];

  const sizes = PIPE_SIZE_TABLES[input.material];
  const roughnessMm = ROUGHNESS_MM[input.material];

  const results: PipeSizeResult[] = sizes.map((size) => {
    const loss = singlePipeHeadLoss({
      idMm: size.idMm,
      roughnessMm,
      lengthM: input.pipeLengthM,
      flowLpm: input.flowRateLpm,
      totalK,
      nu,
    });
    const totalPressureDropPa = loss.headLossM * rho * GRAVITY;
    const pressureDropPaPerM = totalPressureDropPa / input.pipeLengthM;

    const velocityInRange =
      loss.velocityMs >= velocityRange.min && loss.velocityMs <= velocityRange.max;
    const pressureDropInGuideline =
      pressureDropPaPerM >= RECOMMENDED_PA_PER_M.min * 0.5 &&
      pressureDropPaPerM <= RECOMMENDED_PA_PER_M.max * 1.5;

    return {
      size,
      velocityMs: loss.velocityMs,
      reynolds: loss.reynolds,
      flowRegime: loss.flowRegime,
      frictionFactor: loss.frictionFactor,
      majorLossM: loss.majorLossM,
      minorLossM: loss.minorLossM,
      totalHeadLossM: loss.headLossM,
      totalPressureDropPa,
      pressureDropPaPerM,
      velocityInRange,
      pressureDropInGuideline,
    };
  });

  let recommendedIndex = results.findIndex((r) => r.velocityInRange);
  if (recommendedIndex === -1) {
    recommendedIndex = results.findIndex((r) => r.velocityMs <= velocityRange.max);
  }
  if (recommendedIndex === -1) {
    recommendedIndex = results.length - 1;
  }

  return { rho, nu, totalK, velocityRange, results, recommendedIndex };
}
