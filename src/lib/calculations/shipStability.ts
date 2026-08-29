// Naval Architecture — initial transverse stability (metacentric height,
// GM) for a box-shaped/rectangular hull (barge/pontoon), the standard
// simplified case taught in introductory naval architecture before
// hydrostatic-curve-based analysis of real hull forms.
//
//   GM = KB + BM - KG
//   KB = T/2                    (centroid of a rectangular submerged
//                                 cross-section — exact geometry, box hull)
//   BM = I / V,  I = L*B^3/12    (waterplane moment of inertia, rectangle)
//      => BM = B^2 / (12*T)
//   V = L*B*T                    (displaced volume)
//   Displacement = V * rho       (rho: seawater 1.025 t/m3, freshwater 1.000)
//
// General GM = KB+BM-KG formula and the IMO minimum GM requirement
// (0.15 m, IS Code 2008 for cargo ships) cross-checked via web search.
// KB=T/2 and BM=B^2/(12T) for a box hull are exact geometric results (not
// external data) once the general formula is confirmed.
//
// Stability rule of thumb: GM > 0 required for initial stability (the
// vessel returns upright after a small heel); very large GM makes for an
// uncomfortably "stiff" (fast-rolling) vessel, very small positive GM
// makes for a "tender" (slow, large-roll) vessel.
//
// Design-aid / educational tool only — real hulls are not box-shaped, and
// this omits free-surface correction (FSC) for slack tanks, large-angle
// (GZ curve) stability, and dynamic effects. Final vessel stability must
// be verified by a licensed naval architect via a full stability booklet
// and, where required, inclining test.

export interface ShipStabilityInput {
  lengthM: number;
  beamM: number;
  draftM: number;
  kgM: number; // height of center of gravity above keel
  waterDensityTM3: number; // 1.025 seawater, 1.000 freshwater
}

export interface ShipStabilityResult {
  displacementVolumeM3: number;
  displacementTonnes: number;
  kbM: number;
  bmM: number;
  kmM: number;
  gmM: number;
  isStable: boolean;
  meetsImoMinimum: boolean;
}

export const IMO_MINIMUM_GM_M = 0.15;

export function calculateShipStability(input: ShipStabilityInput): ShipStabilityResult {
  const displacementVolumeM3 = input.lengthM * input.beamM * input.draftM;
  const displacementTonnes = displacementVolumeM3 * input.waterDensityTM3;

  const kbM = input.draftM / 2;
  const bmM = input.beamM ** 2 / (12 * input.draftM);
  const kmM = kbM + bmM;
  const gmM = kmM - input.kgM;

  return {
    displacementVolumeM3,
    displacementTonnes,
    kbM,
    bmM,
    kmM,
    gmM,
    isStable: gmM > 0,
    meetsImoMinimum: gmM >= IMO_MINIMUM_GM_M,
  };
}
