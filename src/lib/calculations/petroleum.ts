// Petroleum Engineering: volumetric hydrocarbons-in-place estimation and
// steady-state (pseudo-steady-state) radial well inflow via Darcy's law.
// This module intentionally uses oilfield units (acres, ft, psi, md, cp,
// bbl) rather than SI — this is the actual international industry
// standard for petroleum engineering regardless of country, unlike most
// other engineering disciplines. Formulas cross-checked via web search.
//
//   OOIP (STB) = 7758 * A(acres) * h(ft) * phi * (1-Sw) / Boi
//   OGIP (scf) = 43560 * A(acres) * h(ft) * phi * (1-Sw) / Bgi
//     (7758 = bbl per acre-ft; 43560 = ft^2 per acre, so acre-ft in ft^3)
//
//   Pseudo-steady-state radial (Darcy) oil well inflow:
//     q (STB/day) = k*h*(Pe-Pwf) / [141.2 * mu * Bo * (ln(re/rw) - 0.75 + s)]
//     (141.2 is the oilfield-units Darcy constant; equivalently 1/0.00708)
//
// Design-aid / educational tool only — volumetric estimates depend heavily
// on the quality of the input reservoir parameters (from log/core/seismic
// interpretation), and the inflow equation assumes pseudo-steady-state,
// homogeneous, single-phase radial flow — not valid near wellbore for
// multiphase flow, hydraulically fractured wells, or transient (early-time)
// conditions. Final reserves and well performance estimates must be
// reviewed by a licensed/qualified reservoir engineer.

export interface VolumetricInput {
  areaAcres: number;
  netPayFt: number;
  porosityFrac: number;
  waterSaturationFrac: number;
  formationVolumeFactor: number; // Boi (RB/STB) for oil, Bgi (rcf/scf) for gas
}

export function calculateOilInPlace(input: VolumetricInput): number {
  return (
    (7758 *
      input.areaAcres *
      input.netPayFt *
      input.porosityFrac *
      (1 - input.waterSaturationFrac)) /
    input.formationVolumeFactor
  );
}

export function calculateGasInPlace(input: VolumetricInput): number {
  return (
    (43560 *
      input.areaAcres *
      input.netPayFt *
      input.porosityFrac *
      (1 - input.waterSaturationFrac)) /
    input.formationVolumeFactor
  );
}

export interface WellInflowInput {
  permeabilityMd: number;
  netPayFt: number;
  reservoirPressurePsi: number; // Pe
  flowingBhpPsi: number; // Pwf
  oilViscosityCp: number;
  oilFvfRbStb: number; // Bo
  drainageRadiusFt: number; // re
  wellboreRadiusFt: number; // rw
  skinFactor: number; // s
}

export interface WellInflowResult {
  flowRateStbDay: number;
  productivityIndexStbDayPerPsi: number;
}

export function calculateWellInflow(input: WellInflowInput): WellInflowResult {
  const lnTerm = Math.log(input.drainageRadiusFt / input.wellboreRadiusFt) - 0.75 + input.skinFactor;
  const denominator = 141.2 * input.oilViscosityCp * input.oilFvfRbStb * lnTerm;

  const productivityIndexStbDayPerPsi =
    (input.permeabilityMd * input.netPayFt) / denominator;
  const flowRateStbDay =
    productivityIndexStbDayPerPsi * (input.reservoirPressurePsi - input.flowingBhpPsi);

  return { flowRateStbDay, productivityIndexStbDayPerPsi };
}
