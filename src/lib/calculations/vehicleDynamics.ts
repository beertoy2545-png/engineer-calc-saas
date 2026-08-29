// Automotive Engineering — Vehicle Dynamics: braking/stopping distance and
// longitudinal weight transfer under braking. Standard kinematics and
// rigid-body vehicle dynamics formulas, cross-checked via web search.
//
//   Deceleration:        a = mu * g                       (tire-road friction limited)
//   Reaction distance:   d_reaction = v * t_reaction
//   Braking distance:    d_braking  = v^2 / (2*a)
//   Total stopping dist: d_total    = d_reaction + d_braking
//   Weight transfer:     dW = m * a * h_cg / wheelbase      (shifts toward
//                              front axle under braking, rear under accel)
//
// Design-aid / educational tool only — a simplified rigid-body, single
// axis (longitudinal) model. Does not account for tire load sensitivity,
// suspension dynamics, aerodynamic effects, ABS behavior, or road grade.
// Real stopping distances vary with tire condition, road surface, and
// weather — never rely on this for safety-critical following-distance
// decisions.

export interface BrakingInput {
  initialSpeedKmh: number;
  reactionTimeS: number;
  frictionCoefficient: number; // mu
  gravityMs2: number;
  vehicleMassKg: number;
  cgHeightM: number;
  wheelbaseM: number;
  staticFrontWeightFraction: number; // e.g. 0.5 for 50/50 distribution
}

export interface BrakingResult {
  initialSpeedMs: number;
  decelerationMs2: number;
  decelerationG: number;
  reactionDistanceM: number;
  brakingDistanceM: number;
  totalStoppingDistanceM: number;
  weightTransferN: number;
  weightTransferKgEquivalent: number;
  staticFrontLoadN: number;
  dynamicFrontLoadN: number;
  staticRearLoadN: number;
  dynamicRearLoadN: number;
}

export function calculateBraking(input: BrakingInput): BrakingResult {
  const initialSpeedMs = input.initialSpeedKmh / 3.6;
  const decelerationMs2 = input.frictionCoefficient * input.gravityMs2;
  const decelerationG = input.frictionCoefficient;

  const reactionDistanceM = initialSpeedMs * input.reactionTimeS;
  const brakingDistanceM = initialSpeedMs ** 2 / (2 * decelerationMs2);
  const totalStoppingDistanceM = reactionDistanceM + brakingDistanceM;

  const totalWeightN = input.vehicleMassKg * input.gravityMs2;
  const weightTransferN =
    (input.vehicleMassKg * decelerationMs2 * input.cgHeightM) / input.wheelbaseM;
  const weightTransferKgEquivalent = weightTransferN / input.gravityMs2;

  const staticFrontLoadN = totalWeightN * input.staticFrontWeightFraction;
  const staticRearLoadN = totalWeightN * (1 - input.staticFrontWeightFraction);

  return {
    initialSpeedMs,
    decelerationMs2,
    decelerationG,
    reactionDistanceM,
    brakingDistanceM,
    totalStoppingDistanceM,
    weightTransferN,
    weightTransferKgEquivalent,
    staticFrontLoadN,
    dynamicFrontLoadN: staticFrontLoadN + weightTransferN,
    staticRearLoadN,
    dynamicRearLoadN: staticRearLoadN - weightTransferN,
  };
}
