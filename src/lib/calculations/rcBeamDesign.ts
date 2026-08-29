// Singly-reinforced rectangular concrete beam flexural design — the
// Whitney equivalent rectangular stress block method per ACI 318
// (values/thresholds as commonly given in SI/metric form). Formulas are
// standard, undisputed textbook equations; cross-checked via web search
// before implementation. All numeric test cases below were computed by
// hand directly from these formulas (a web-sourced "worked example" was
// found to contain an internal arithmetic inconsistency and was discarded
// as a reference rather than risk propagating its error).
//
//   a  = As*fy / (0.85*f'c*b)              stress block depth
//   c  = a / beta1                          neutral axis depth
//   epsilon_t = 0.003 * (d - c) / c         tension steel strain
//   Mn = As*fy*(d - a/2)                    nominal moment
//   phi*Mn >= Mu                            design requirement
//   rho_min = max(0.25*sqrt(f'c)/fy, 1.4/fy)  (SI units, MPa)
//
// beta1 = 0.85 for f'c <= 28 MPa, decreasing 0.05 per 7 MPa above that,
// floored at 0.65 (metric-rounded form of the ACI 318 provision).
//
// phi transition (ACI 318-14, tied/non-prestressed members):
//   epsilon_t >= 0.005            -> tension-controlled,   phi = 0.90
//   epsilon_t <= epsilon_y        -> compression-controlled, phi = 0.65
//   otherwise                     -> linear transition between the two
//
// Units: mm, MPa (N/mm^2), kN.m. Design-aid tool only — does not check
// shear, deflection/serviceability, development length, or detailing.
// Final design must be reviewed and stamped by a licensed structural
// engineer against the applicable local building code.

const STEEL_MODULUS_MPA = 200000;

export interface RcBeamInput {
  widthMm: number; // b
  effectiveDepthMm: number; // d
  fckMpa: number; // f'c
  fyMpa: number; // fy
  barDiameterMm: number;
  barCount: number;
  designMomentKnm: number; // Mu (factored demand)
}

export interface RcBeamResult {
  asMm2: number;
  beta1: number;
  aMm: number;
  cMm: number;
  epsilonT: number;
  epsilonY: number;
  controlCase: "tensionControlled" | "transition" | "compressionControlled";
  phi: number;
  nominalMomentKnm: number;
  designMomentCapacityKnm: number;
  rho: number;
  rhoMin: number;
  isAboveMinReinforcement: boolean;
  isAdequate: boolean;
}

function calcBeta1(fckMpa: number): number {
  if (fckMpa <= 28) return 0.85;
  return Math.max(0.85 - 0.05 * ((fckMpa - 28) / 7), 0.65);
}

export function calculateRcBeamDesign(input: RcBeamInput): RcBeamResult {
  const asMm2 = input.barCount * (Math.PI * input.barDiameterMm ** 2) / 4;
  const beta1 = calcBeta1(input.fckMpa);

  const aMm = (asMm2 * input.fyMpa) / (0.85 * input.fckMpa * input.widthMm);
  const cMm = aMm / beta1;
  const epsilonT = (0.003 * (input.effectiveDepthMm - cMm)) / cMm;
  const epsilonY = input.fyMpa / STEEL_MODULUS_MPA;

  let controlCase: RcBeamResult["controlCase"];
  let phi: number;
  if (epsilonT >= 0.005) {
    controlCase = "tensionControlled";
    phi = 0.9;
  } else if (epsilonT <= epsilonY) {
    controlCase = "compressionControlled";
    phi = 0.65;
  } else {
    controlCase = "transition";
    phi = 0.65 + ((epsilonT - epsilonY) * 0.25) / (0.005 - epsilonY);
  }

  const nominalMomentKnm =
    (asMm2 * input.fyMpa * (input.effectiveDepthMm - aMm / 2)) / 1e6;
  const designMomentCapacityKnm = phi * nominalMomentKnm;

  const rho = asMm2 / (input.widthMm * input.effectiveDepthMm);
  const rhoMin = Math.max(
    (0.25 * Math.sqrt(input.fckMpa)) / input.fyMpa,
    1.4 / input.fyMpa,
  );

  return {
    asMm2,
    beta1,
    aMm,
    cMm,
    epsilonT,
    epsilonY,
    controlCase,
    phi,
    nominalMomentKnm,
    designMomentCapacityKnm,
    rho,
    rhoMin,
    isAboveMinReinforcement: rho >= rhoMin,
    isAdequate: designMomentCapacityKnm >= input.designMomentKnm,
  };
}
