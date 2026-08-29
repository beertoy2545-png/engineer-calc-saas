// Aerospace Engineering: rocket propulsion (Tsiolkovsky ideal rocket
// equation) and two-body circular orbital mechanics. Classical Newtonian
// mechanics — formulas and constants cross-checked via web search before
// implementation.
//
//   Rocket equation:  dv = Isp * g0 * ln(m0/mf)      (v_exhaust = Isp*g0)
//   Circular orbital velocity: v = sqrt(mu / r)
//   Orbital period:            T = 2*pi*sqrt(r^3 / mu)
//   Escape velocity:           v_esc = sqrt(2*mu / r)
//
// g0 = 9.80665 m/s^2 (standard gravity, exact defined value)
// Earth mu (GM) = 3.986004418e14 m^3/s^2, Earth mean radius = 6371 km
//
// Design-aid / educational tool only. The rocket equation gives the ideal
// (vacuum, no gravity/drag losses) delta-v — real launch delta-v budgets
// are higher due to gravity losses, drag, and steering losses. Orbital
// mechanics here covers circular orbits only, not general elliptical
// transfer orbits (e.g. Hohmann transfers).

export const STANDARD_GRAVITY_MS2 = 9.80665;
export const EARTH_MU_M3S2 = 3.986004418e14;
export const EARTH_RADIUS_M = 6371000;

export interface RocketEquationInput {
  specificImpulseS: number;
  wetMassKg: number; // m0, includes propellant
  dryMassKg: number; // mf, after propellant burned
}

export interface RocketEquationResult {
  exhaustVelocityMs: number;
  massRatio: number;
  propellantMassKg: number;
  propellantMassFraction: number;
  deltaVMs: number;
}

export function calculateRocketEquation(
  input: RocketEquationInput,
): RocketEquationResult {
  const exhaustVelocityMs = input.specificImpulseS * STANDARD_GRAVITY_MS2;
  const massRatio = input.wetMassKg / input.dryMassKg;
  const propellantMassKg = input.wetMassKg - input.dryMassKg;
  const propellantMassFraction = propellantMassKg / input.wetMassKg;
  const deltaVMs = exhaustVelocityMs * Math.log(massRatio);

  return {
    exhaustVelocityMs,
    massRatio,
    propellantMassKg,
    propellantMassFraction,
    deltaVMs,
  };
}

export interface OrbitalMechanicsInput {
  centralBodyMuM3S2: number;
  centralBodyRadiusM: number;
  altitudeM: number;
}

export interface OrbitalMechanicsResult {
  orbitalRadiusM: number;
  orbitalVelocityMs: number;
  orbitalPeriodS: number;
  escapeVelocityMs: number;
}

export function calculateOrbitalMechanics(
  input: OrbitalMechanicsInput,
): OrbitalMechanicsResult {
  const orbitalRadiusM = input.centralBodyRadiusM + input.altitudeM;
  const orbitalVelocityMs = Math.sqrt(input.centralBodyMuM3S2 / orbitalRadiusM);
  const orbitalPeriodS =
    2 * Math.PI * Math.sqrt(orbitalRadiusM ** 3 / input.centralBodyMuM3S2);
  const escapeVelocityMs = Math.sqrt((2 * input.centralBodyMuM3S2) / orbitalRadiusM);

  return { orbitalRadiusM, orbitalVelocityMs, orbitalPeriodS, escapeVelocityMs };
}
