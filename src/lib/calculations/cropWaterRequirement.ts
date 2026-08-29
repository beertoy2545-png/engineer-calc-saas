// Agricultural Engineering — crop water requirement and irrigation
// scheduling via the FAO-56 crop coefficient method (globally standard,
// FAO Irrigation and Drainage Paper No. 56). Formula, Kc values, and
// irrigation efficiency ranges cross-checked via web search.
//
//   ETc = Kc * ETo                                (crop evapotranspiration)
//   Net irrigation requirement = ETc - effective rainfall
//   TAW = (theta_FC - theta_WP) * Zr * 1000        (total available water, mm)
//   RAW = MAD * TAW                                 (readily available water)
//   Irrigation interval (days) = RAW / ETc
//   Gross irrigation depth = RAW / efficiency
//   Volume (m3) = depth(mm) * area(m2) / 1000
//
// Kc (mid-season) reference values (FAO-56): Wheat 1.15, Maize/Corn 1.20,
// Rice (paddy) 1.20. Irrigation efficiency typical ranges: drip 70-90%,
// sprinkler 60-75% (surface/furrow typically lower, not included — no
// verified typical range found during research).
//
// Design-aid tool only — a simplified single-crop, single-layer soil
// water balance for the mid-season growth stage. Does not account for
// growth-stage-varying Kc, deep percolation, capillary rise, salinity
// leaching requirement, or paddy-rice ponding water management (which
// differs substantially from the depletion-based scheduling used here).
// Final irrigation system design must be reviewed by a licensed
// agricultural/irrigation engineer using local climate and soil data.

export interface CropPreset {
  key: string;
  label: string;
  kcMid: number;
}

export const CROP_PRESETS: CropPreset[] = [
  { key: "wheat", label: "ข้าวสาลี (Wheat)", kcMid: 1.15 },
  { key: "corn", label: "ข้าวโพด (Maize/Corn)", kcMid: 1.2 },
  { key: "rice", label: "ข้าว (Rice, Paddy)", kcMid: 1.2 },
  { key: "custom", label: "กำหนดเอง (Custom Kc)", kcMid: 1.0 },
];

export interface CropWaterInput {
  refEtoMmDay: number;
  cropCoefficientKc: number;
  effectiveRainfallMmDay: number;
  fieldCapacityFrac: number; // theta_FC, volumetric (m3/m3)
  wiltingPointFrac: number; // theta_WP, volumetric (m3/m3)
  rootDepthM: number;
  managementAllowedDepletion: number; // MAD, typically 0.5
  irrigationEfficiencyPct: number;
  fieldAreaHa: number;
}

export interface CropWaterResult {
  etcMmDay: number;
  netIrrigationMmDay: number;
  totalAvailableWaterMm: number;
  readilyAvailableWaterMm: number;
  irrigationIntervalDays: number;
  grossIrrigationDepthMm: number;
  irrigationVolumeM3: number;
}

export function calculateCropWaterRequirement(
  input: CropWaterInput,
): CropWaterResult {
  const etcMmDay = input.cropCoefficientKc * input.refEtoMmDay;
  const netIrrigationMmDay = Math.max(etcMmDay - input.effectiveRainfallMmDay, 0);

  const totalAvailableWaterMm =
    (input.fieldCapacityFrac - input.wiltingPointFrac) * input.rootDepthM * 1000;
  const readilyAvailableWaterMm =
    input.managementAllowedDepletion * totalAvailableWaterMm;

  const irrigationIntervalDays =
    netIrrigationMmDay > 0 ? readilyAvailableWaterMm / netIrrigationMmDay : Infinity;

  const grossIrrigationDepthMm =
    readilyAvailableWaterMm / (input.irrigationEfficiencyPct / 100);

  const areaM2 = input.fieldAreaHa * 10000;
  const irrigationVolumeM3 = (grossIrrigationDepthMm * areaM2) / 1000;

  return {
    etcMmDay,
    netIrrigationMmDay,
    totalAvailableWaterMm,
    readilyAvailableWaterMm,
    irrigationIntervalDays,
    grossIrrigationDepthMm,
    irrigationVolumeM3,
  };
}
