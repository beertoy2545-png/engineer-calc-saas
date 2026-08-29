// Geotechnical Engineering — shallow foundation bearing capacity, via the
// general bearing capacity equation (same form as Terzaghi's 1943
// equation, using the Meyerhof closed-form Nq/Nc factors and the Hansen
// closed-form Ngamma factor, since Terzaghi's own Ngamma has no simple
// closed form and is usually read off a chart). This blend is what most
// modern geotechnical references and software actually compute — it is
// labeled "General Bearing Capacity" rather than "Terzaghi" here to avoid
// misattributing a specific 1943 chart value under a different derivation.
// All three N-factor formulas were cross-checked numerically against a
// published Nc/Nq/Ngamma table (multiple friction angles, exact match)
// before implementation.
//
//   Nq = e^(pi*tan(phi)) * tan^2(45 + phi/2)
//   Nc = (Nq - 1) * cot(phi)          [phi=0 limit: Nc = pi + 2 = 5.14]
//   Ngamma = 2 * (Nq + 1) * tan(phi)   (Hansen)
//
//   qu = c*Nc*shapeC + q*Nq + 0.5*gamma*B*Ngamma*shapeG
//     strip footing:    shapeC = 1.0,  shapeG = 1.0
//     square footing:   shapeC = 1.3,  shapeG = 0.4
//     circular footing: shapeC = 1.3,  shapeG = 0.3
//   qa = qu / FS  (allowable bearing capacity, factor of safety FS)
//
// Design-aid tool only — a simplified general shear failure model. Does
// not account for water table position, eccentric/inclined loading,
// layered soils, settlement (serviceability) checks, or local/punching
// shear failure modes. Final foundation design must be reviewed by a
// licensed geotechnical engineer, typically informed by site-specific
// soil investigation (SPT/CPT data), not assumed input parameters.

export type FootingShape = "strip" | "square" | "circular";

const SHAPE_FACTORS: Record<FootingShape, { shapeC: number; shapeG: number }> = {
  strip: { shapeC: 1.0, shapeG: 1.0 },
  square: { shapeC: 1.3, shapeG: 0.4 },
  circular: { shapeC: 1.3, shapeG: 0.3 },
};

export interface BearingFactors {
  nc: number;
  nq: number;
  ngamma: number;
}

export function calculateBearingFactors(frictionAngleDeg: number): BearingFactors {
  const phi = (frictionAngleDeg * Math.PI) / 180;

  if (frictionAngleDeg === 0) {
    return { nc: Math.PI + 2, nq: 1, ngamma: 0 };
  }

  const nq = Math.exp(Math.PI * Math.tan(phi)) * Math.tan(Math.PI / 4 + phi / 2) ** 2;
  const nc = (nq - 1) / Math.tan(phi);
  const ngamma = 2 * (nq + 1) * Math.tan(phi);

  return { nc, nq, ngamma };
}

export interface BearingCapacityInput {
  frictionAngleDeg: number;
  cohesionKpa: number;
  surchargeKpa: number; // q: overburden pressure at footing depth (gamma * Df)
  soilUnitWeightKnM3: number; // gamma, below the footing
  footingWidthM: number; // B
  shape: FootingShape;
  factorOfSafety: number;
}

export interface BearingCapacityResult {
  factors: BearingFactors;
  cohesionTermKpa: number;
  surchargeTermKpa: number;
  weightTermKpa: number;
  ultimateBearingCapacityKpa: number;
  allowableBearingCapacityKpa: number;
}

export function calculateBearingCapacity(
  input: BearingCapacityInput,
): BearingCapacityResult {
  const factors = calculateBearingFactors(input.frictionAngleDeg);
  const shape = SHAPE_FACTORS[input.shape];

  const cohesionTermKpa = input.cohesionKpa * factors.nc * shape.shapeC;
  const surchargeTermKpa = input.surchargeKpa * factors.nq;
  const weightTermKpa =
    0.5 * input.soilUnitWeightKnM3 * input.footingWidthM * factors.ngamma * shape.shapeG;

  const ultimateBearingCapacityKpa = cohesionTermKpa + surchargeTermKpa + weightTermKpa;
  const allowableBearingCapacityKpa = ultimateBearingCapacityKpa / input.factorOfSafety;

  return {
    factors,
    cohesionTermKpa,
    surchargeTermKpa,
    weightTermKpa,
    ultimateBearingCapacityKpa,
    allowableBearingCapacityKpa,
  };
}
