// Materials Science / Mechanical Design — Fatigue analysis via the
// Modified Goodman criterion, with an optional Marin-factor endurance
// limit estimator. Directly closes a gap flagged in the Shaft Design
// module's disclaimer ("does not include detailed Soderberg fatigue
// analysis").
//
//   Modified Goodman safety factor: 1/Ns = sigma_a/Se + sigma_m/Sut
//
//   Marin equation: Se = ka * kb * kc * kd * ke * Se'
//     Se' = 0.504*Sut (Sut <= 1400 MPa), else 700 MPa (steel)
//     ka = a * Sut^b     (surface finish factor)
//     kb = 1.24 * d^-0.107   (round bar, bending/torsion, 2.79-51mm)
//         = 1 for axial loading (no size effect)
//     kc = 1.0 bending, 0.85 axial, 0.59 torsion
//
// ka table coverage note: only two surface finishes were independently
// verified via a fully worked numeric example during research (Machined:
// a=4.45 b=-0.265 -> ka=0.88 at Sut=448 MPa; As-Forged: a=271 b=-0.995 ->
// ka=0.201 at Sut=1400 MPa — both recomputed and matched exactly). A
// third source's "Ground"/"Hot-Rolled" coefficients were internally
// inconsistent with these verified values, so those two finishes were
// deliberately left out rather than guessed — use "Custom" to enter your
// own ka for other finishes.
//
// Design-aid tool only — real fatigue design also requires stress
// concentration factors (Kf), a validated Se (ideally from test data),
// and often a full S-N/Basquin finite-life analysis. Final fatigue
// design must be reviewed by a licensed mechanical engineer.

export type LoadType = "bending" | "axial" | "torsion";
export type SurfaceFinish = "machined" | "asForged" | "custom";

const LOAD_FACTOR_KC: Record<LoadType, number> = {
  bending: 1.0,
  axial: 0.85,
  torsion: 0.59,
};

export const SURFACE_FINISH_COEFFICIENTS: Record<
  Exclude<SurfaceFinish, "custom">,
  { a: number; b: number; label: string }
> = {
  machined: { a: 4.45, b: -0.265, label: "Machined / Cold-Drawn" },
  asForged: { a: 271, b: -0.995, label: "As-Forged" },
};

export function calculateSurfaceFactor(
  finish: SurfaceFinish,
  sutMpa: number,
  customKa?: number,
): number {
  if (finish === "custom") return customKa ?? 1;
  const { a, b } = SURFACE_FINISH_COEFFICIENTS[finish];
  return Math.min(a * Math.pow(sutMpa, b), 1);
}

export function calculateSizeFactor(loadType: LoadType, diameterMm: number): number {
  if (loadType === "axial") return 1;
  if (diameterMm < 2.79 || diameterMm > 51) return 1; // outside validated range
  return 1.24 * Math.pow(diameterMm, -0.107);
}

export function calculateBaseEnduranceLimit(sutMpa: number): number {
  return sutMpa <= 1400 ? 0.504 * sutMpa : 700;
}

export interface EnduranceLimitInput {
  sutMpa: number;
  loadType: LoadType;
  surfaceFinish: SurfaceFinish;
  customKa?: number;
  diameterMm: number;
}

export interface EnduranceLimitResult {
  baseEnduranceLimitMpa: number;
  ka: number;
  kb: number;
  kc: number;
  correctedEnduranceLimitMpa: number;
}

export function calculateEnduranceLimit(input: EnduranceLimitInput): EnduranceLimitResult {
  const baseEnduranceLimitMpa = calculateBaseEnduranceLimit(input.sutMpa);
  const ka = calculateSurfaceFactor(input.surfaceFinish, input.sutMpa, input.customKa);
  const kb = calculateSizeFactor(input.loadType, input.diameterMm);
  const kc = LOAD_FACTOR_KC[input.loadType];
  const correctedEnduranceLimitMpa = ka * kb * kc * baseEnduranceLimitMpa;

  return { baseEnduranceLimitMpa, ka, kb, kc, correctedEnduranceLimitMpa };
}

export interface GoodmanInput {
  alternatingStressMpa: number;
  meanStressMpa: number;
  enduranceLimitMpa: number;
  ultimateTensileMpa: number;
}

export interface GoodmanResult {
  safetyFactor: number;
  isInfiniteLife: boolean;
  goodmanUtilization: number; // fraction of the Goodman line used (1.0 = right at failure line)
}

export function calculateGoodmanSafetyFactor(input: GoodmanInput): GoodmanResult {
  const utilization =
    input.alternatingStressMpa / input.enduranceLimitMpa +
    input.meanStressMpa / input.ultimateTensileMpa;

  const safetyFactor = utilization > 0 ? 1 / utilization : Infinity;

  return {
    safetyFactor,
    isInfiniteLife: safetyFactor >= 1,
    goodmanUtilization: utilization,
  };
}
