// Simplified sensible-heat cooling load estimator (rule-of-thumb method).
// NOT a substitute for a full ASHRAE Manual J / detailed load calculation —
// intended for quick sizing estimates only, pending review by a licensed
// mechanical/HVAC engineer before this is presented as anything more.

export type GlazingType = "single" | "double" | "lowE";

export interface CoolingLoadInput {
  areaM2: number;
  ceilingHeightM: number;
  occupants: number;
  lightingWattsPerM2: number;
  equipmentWatts: number;
  windowAreaM2: number;
  glazingType: GlazingType;
  outdoorTempC: number;
  indoorTempC: number;
  safetyFactorPct: number;
}

export interface CoolingLoadResult {
  peopleLoadBtuH: number;
  lightingLoadBtuH: number;
  equipmentLoadBtuH: number;
  envelopeLoadBtuH: number;
  solarLoadBtuH: number;
  subtotalBtuH: number;
  totalWithSafetyBtuH: number;
  totalKw: number;
  totalTons: number;
  recommendedBtuSize: number;
}

const BTU_PER_WATT = 3.412;
const HEAT_PER_PERSON_BTU_H = 500; // moderate office activity, sensible + latent
const WALL_ROOF_U_VALUE = 2.5; // W/m2K, uninsulated masonry, rough estimate
const SHGC_BY_GLAZING: Record<GlazingType, number> = {
  single: 0.8,
  double: 0.6,
  lowE: 0.35,
};
const SOLAR_GAIN_W_PER_M2 = 500; // average incident solar radiation on glazing
const STANDARD_AC_SIZES_BTU = [9000, 12000, 18000, 24000, 30000, 36000, 48000, 60000];

export function calculateCoolingLoad(input: CoolingLoadInput): CoolingLoadResult {
  const deltaT = Math.max(input.outdoorTempC - input.indoorTempC, 0);

  const peopleLoadBtuH = input.occupants * HEAT_PER_PERSON_BTU_H;

  const lightingLoadBtuH =
    input.areaM2 * input.lightingWattsPerM2 * BTU_PER_WATT;

  const equipmentLoadBtuH = input.equipmentWatts * BTU_PER_WATT;

  const wallRoofAreaM2 = input.areaM2 * 1.2 + input.ceilingHeightM * 4; // rough envelope proxy
  const envelopeLoadBtuH =
    wallRoofAreaM2 * WALL_ROOF_U_VALUE * deltaT * BTU_PER_WATT;

  const solarLoadBtuH =
    input.windowAreaM2 *
    SOLAR_GAIN_W_PER_M2 *
    SHGC_BY_GLAZING[input.glazingType] *
    BTU_PER_WATT;

  const subtotalBtuH =
    peopleLoadBtuH +
    lightingLoadBtuH +
    equipmentLoadBtuH +
    envelopeLoadBtuH +
    solarLoadBtuH;

  const totalWithSafetyBtuH =
    subtotalBtuH * (1 + input.safetyFactorPct / 100);

  const totalKw = (totalWithSafetyBtuH / 3412) * 1;
  const totalTons = totalWithSafetyBtuH / 12000;

  const recommendedBtuSize =
    STANDARD_AC_SIZES_BTU.find((size) => size >= totalWithSafetyBtuH) ??
    STANDARD_AC_SIZES_BTU[STANDARD_AC_SIZES_BTU.length - 1];

  return {
    peopleLoadBtuH,
    lightingLoadBtuH,
    equipmentLoadBtuH,
    envelopeLoadBtuH,
    solarLoadBtuH,
    subtotalBtuH,
    totalWithSafetyBtuH,
    totalKw,
    totalTons,
    recommendedBtuSize,
  };
}
