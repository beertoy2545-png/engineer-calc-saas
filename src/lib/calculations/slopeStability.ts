// Mining / Geotechnical Engineering — infinite slope stability (Factor of
// Safety) for a planar failure surface parallel to the slope face, the
// standard simplified model for long uniform slopes (open-pit mine
// benches, embankments, natural hillslopes) before more complex circular/
// wedge failure analysis. Formula cross-checked via web search.
//
//   FS = tan(phi)/tan(beta) + c / (gamma*z*sin(beta)*cos(beta))
//
//   phi   = soil/rock mass friction angle
//   beta  = slope face angle from horizontal
//   c     = cohesion
//   gamma = unit weight
//   z     = vertical depth to the potential failure surface
//
// This is the DRY case (no water table / pore pressure) only — a water
// table raises pore pressure and reduces the effective normal stress,
// which lowers FS. That extension was deliberately left out here: the
// pore-pressure term's exact convention (perpendicular vs. vertical
// water height, saturated vs. total unit weight) varied enough across
// sources during research that implementing it with confidence would
// need a single fully-worked reference example, which wasn't found —
// so only the unambiguous dry case is implemented.
//
// Interpretation: for a cohesionless soil/rock mass (c=0), FS = tan(phi)/
// tan(beta), independent of depth z — the slope is only stable while
// beta < phi.
//
// Design-aid tool only — a simplified planar/infinite-slope model. Real
// pit/embankment slopes need site-specific geotechnical investigation,
// groundwater assessment, and (for anything but a uniform infinite slope)
// circular or wedge failure analysis. Final slope design must be
// reviewed by a licensed geotechnical/mining engineer.

export interface SlopeStabilityInput {
  cohesionKpa: number;
  frictionAngleDeg: number;
  unitWeightKnM3: number;
  slopeAngleDeg: number;
  depthM: number;
}

export interface SlopeStabilityResult {
  frictionTermFs: number;
  cohesionTermFs: number;
  factorOfSafety: number;
  isStable: boolean; // FS >= 1
  meetsTypicalDesignMinimum: boolean; // FS >= 1.5, a commonly cited design target
}

export const TYPICAL_DESIGN_MINIMUM_FS = 1.5;

export function calculateSlopeStability(
  input: SlopeStabilityInput,
): SlopeStabilityResult {
  const phi = (input.frictionAngleDeg * Math.PI) / 180;
  const beta = (input.slopeAngleDeg * Math.PI) / 180;

  const frictionTermFs = Math.tan(phi) / Math.tan(beta);
  const cohesionTermFs =
    input.cohesionKpa /
    (input.unitWeightKnM3 * input.depthM * Math.sin(beta) * Math.cos(beta));

  const factorOfSafety = frictionTermFs + cohesionTermFs;

  return {
    frictionTermFs,
    cohesionTermFs,
    factorOfSafety,
    isStable: factorOfSafety >= 1,
    meetsTypicalDesignMinimum: factorOfSafety >= TYPICAL_DESIGN_MINIMUM_FS,
  };
}
