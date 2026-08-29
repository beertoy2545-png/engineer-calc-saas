// Nuclear / Radiological Engineering — radioactive decay and radiation
// shielding (attenuation). Deliberately scoped to health-physics/
// radiation-safety fundamentals (decay, shielding) rather than anything
// reactor/criticality-related. Pure exponential-decay mathematics —
// standard, undisputed physics, cross-checked via web search for formula
// form only (no empirical table dependency, unlike some other modules).
//
//   Decay:      N(t) = N0 * e^(-lambda*t),  lambda = ln(2) / half_life
//               A(t) = A0 * e^(-lambda*t)   (activity follows the same law)
//
//   Shielding (Beer-Lambert): I(x) = I0 * e^(-mu*x)
//               HVL (half-value layer) = ln(2) / mu
//
// Design-aid / educational tool only. Real shielding design must also
// account for buildup factor (scattered radiation), photon energy-
// dependent attenuation coefficients, and geometry (point vs. broad
// beam) — not captured by this simple narrow-beam exponential model.
// Any actual radiation safety or reactor engineering work must be done
// by licensed radiation safety officers / nuclear engineers under
// applicable regulatory requirements.

export interface DecayInput {
  initialActivity: number;
  halfLife: number; // any consistent time unit
  elapsedTime: number; // same time unit as halfLife
}

export interface DecayResult {
  decayConstant: number; // per unit time (1/halfLife's unit)
  remainingActivity: number;
  fractionRemaining: number;
  numberOfHalfLives: number;
}

export function calculateDecay(input: DecayInput): DecayResult {
  const decayConstant = Math.log(2) / input.halfLife;
  const fractionRemaining = Math.exp(-decayConstant * input.elapsedTime);
  const remainingActivity = input.initialActivity * fractionRemaining;
  const numberOfHalfLives = input.elapsedTime / input.halfLife;

  return { decayConstant, remainingActivity, fractionRemaining, numberOfHalfLives };
}

export interface ShieldingInput {
  initialIntensity: number;
  linearAttenuationCoefficientPerCm: number; // mu
  thicknessCm: number;
}

export interface ShieldingResult {
  halfValueLayerCm: number;
  transmittedIntensity: number;
  fractionTransmitted: number;
  percentAttenuated: number;
  numberOfHvls: number;
}

export function calculateShielding(input: ShieldingInput): ShieldingResult {
  const halfValueLayerCm = Math.log(2) / input.linearAttenuationCoefficientPerCm;
  const fractionTransmitted = Math.exp(
    -input.linearAttenuationCoefficientPerCm * input.thicknessCm,
  );
  const transmittedIntensity = input.initialIntensity * fractionTransmitted;

  return {
    halfValueLayerCm,
    transmittedIntensity,
    fractionTransmitted,
    percentAttenuated: (1 - fractionTransmitted) * 100,
    numberOfHvls: input.thicknessCm / halfValueLayerCm,
  };
}
