// Renewable Energy Engineering: solar PV system sizing and wind turbine
// power output. Standard formulas and typical parameter ranges cross-
// checked via web search before implementation.
//
//   Solar PV array size (kW) = DailyLoad(kWh) / (PeakSunHours * DeratingFactor)
//     Peak Sun Hours: typically 3.5-7 h/day depending on location.
//     Derating factor: typically 0.75-0.85 (NREL PVWatts default ~0.77-0.83),
//     combining inverter, wiring, soiling, and mismatch losses.
//
//   Wind turbine power: P = 0.5 * rho * A * v^3 * Cp
//     A = pi * R^2 (rotor swept area)
//     Betz limit: Cp_max = 16/27 = 0.593 (theoretical maximum)
//     Real utility turbines: Cp typically 0.35-0.45 in practice
//
// Design-aid tool only. Solar sizing here is a simplified daily-average
// energy-balance estimate — it does not account for seasonal irradiance
// variation, shading, temperature derating of panels, or battery storage
// sizing. Wind power is the instantaneous power at a single wind speed —
// real turbine output requires integrating over the full wind speed
// probability distribution (e.g. Weibull) and the turbine's power curve
// (cut-in/rated/cut-out speeds), not just this single-point formula.

export const BETZ_LIMIT = 16 / 27;
export const STANDARD_AIR_DENSITY_KG_M3 = 1.225;

export interface SolarSizingInput {
  dailyEnergyKwh: number;
  peakSunHours: number;
  deratingFactor: number;
  panelWattage: number;
}

export interface SolarSizingResult {
  requiredArrayKw: number;
  panelCount: number;
  installedArrayKw: number;
}

export function calculateSolarSizing(input: SolarSizingInput): SolarSizingResult {
  const requiredArrayKw =
    input.dailyEnergyKwh / (input.peakSunHours * input.deratingFactor);
  const panelCount = Math.ceil((requiredArrayKw * 1000) / input.panelWattage);
  const installedArrayKw = (panelCount * input.panelWattage) / 1000;

  return { requiredArrayKw, panelCount, installedArrayKw };
}

export interface WindPowerInput {
  airDensityKgM3: number;
  rotorRadiusM: number;
  windSpeedMs: number;
  powerCoefficient: number; // Cp
}

export interface WindPowerResult {
  sweptAreaM2: number;
  powerW: number;
  betzLimitPowerW: number;
  fractionOfBetzLimit: number;
}

export function calculateWindPower(input: WindPowerInput): WindPowerResult {
  const sweptAreaM2 = Math.PI * input.rotorRadiusM ** 2;
  const dynamicTermW =
    0.5 * input.airDensityKgM3 * sweptAreaM2 * input.windSpeedMs ** 3;

  const powerW = dynamicTermW * input.powerCoefficient;
  const betzLimitPowerW = dynamicTermW * BETZ_LIMIT;

  return {
    sweptAreaM2,
    powerW,
    betzLimitPowerW,
    fractionOfBetzLimit: input.powerCoefficient / BETZ_LIMIT,
  };
}
