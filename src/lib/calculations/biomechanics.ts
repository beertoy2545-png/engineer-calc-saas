// Biomedical Engineering — Biomechanics: single-joint static equilibrium
// analysis (the classic elbow/biceps free-body-diagram problem: muscle
// force and joint reaction force needed to hold a load). Pure statics
// (torque + force balance) applied to a musculoskeletal lever system —
// deliberately NOT a clinical/dosage tool, since drug dosing is a medical
// decision that must not be automated. This is pure Newtonian mechanics,
// the same kind of analysis used in ergonomics, prosthetic/orthotic
// design, and sports biomechanics.
//
// Model: forearm as a rigid lever pivoting at the elbow. Three downward
// forces (forearm weight, load weight) create a torque about the elbow
// that the biceps tension must balance; the humerus then supplies the
// remaining vertical reaction force to keep the forearm in equilibrium.
//
//   Torque balance:  r1*F_muscle = r2*W_forearm + r3*W_load
//   Force balance:    F_joint = F_muscle - (W_forearm + W_load)
//   (F_muscle acts upward near the elbow; F_joint is the downward
//    reaction the humerus exerts on the forearm at the joint)
//
// Validated against the classic OpenStax College Physics worked example
// (r1=0.04m, r2=0.16m, r3=0.38m, forearm=2.5kg, load=4.0kg -> F_muscle=470N,
// F_joint=407N) — see biomechanics.test.ts.
//
// Educational/design-aid tool only — a simplified single-muscle, single-
// plane rigid-lever model. Real joints involve multiple muscles sharing
// the load, non-perpendicular lines of action, and joint-angle-dependent
// moment arms. Not for clinical use.

export interface JointEquilibriumInput {
  muscleMomentArmM: number; // r1: muscle attachment distance from joint
  limbComDistanceM: number; // r2: limb segment's own center-of-mass distance from joint
  loadDistanceM: number; // r3: distance of the held load from the joint
  limbMassKg: number;
  loadMassKg: number;
  gravityMs2: number;
}

export interface JointEquilibriumResult {
  limbWeightN: number;
  loadWeightN: number;
  totalWeightN: number;
  muscleForceN: number;
  jointReactionForceN: number;
  mechanicalAdvantage: number; // r1/r3 — how much smaller the muscle's lever arm is
  forceMultiplier: number; // muscleForce / totalWeight
}

export function calculateJointEquilibrium(
  input: JointEquilibriumInput,
): JointEquilibriumResult {
  const limbWeightN = input.limbMassKg * input.gravityMs2;
  const loadWeightN = input.loadMassKg * input.gravityMs2;
  const totalWeightN = limbWeightN + loadWeightN;

  const muscleForceN =
    (input.limbComDistanceM * limbWeightN + input.loadDistanceM * loadWeightN) /
    input.muscleMomentArmM;

  const jointReactionForceN = muscleForceN - totalWeightN;
  const mechanicalAdvantage = input.muscleMomentArmM / input.loadDistanceM;
  const forceMultiplier = totalWeightN > 0 ? muscleForceN / totalWeightN : 0;

  return {
    limbWeightN,
    loadWeightN,
    totalWeightN,
    muscleForceN,
    jointReactionForceN,
    mechanicalAdvantage,
    forceMultiplier,
  };
}
