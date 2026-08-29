import { describe, expect, it } from "vitest";
import { calculateDecay, calculateShielding } from "./radiationPhysics";

describe("calculateDecay", () => {
  // Hand-calculated: A0=1000, t_half=5730 years (Carbon-14), t=11460 years
  // (exactly 2 half-lives) -> fraction remaining = 1/4 exactly
  it("gives exactly 1/4 remaining after two half-lives", () => {
    const result = calculateDecay({
      initialActivity: 1000,
      halfLife: 5730,
      elapsedTime: 11460,
    });

    expect(result.numberOfHalfLives).toBeCloseTo(2, 6);
    expect(result.fractionRemaining).toBeCloseTo(0.25, 6);
    expect(result.remainingActivity).toBeCloseTo(250, 3);
  });

  it("gives exactly 1/2 remaining after one half-life", () => {
    const result = calculateDecay({
      initialActivity: 800,
      halfLife: 10,
      elapsedTime: 10,
    });
    expect(result.remainingActivity).toBeCloseTo(400, 6);
  });

  it("gives the full initial activity at t=0", () => {
    const result = calculateDecay({
      initialActivity: 500,
      halfLife: 30,
      elapsedTime: 0,
    });
    expect(result.remainingActivity).toBeCloseTo(500, 6);
  });
});

describe("calculateShielding", () => {
  // Hand-calculated: I0=100, mu=0.5/cm, x=2cm
  // I = 100*e^-1 = 36.79, HVL = ln2/0.5 = 1.3863cm, numHVL = 1.4427
  it("matches a hand-calculated case", () => {
    const result = calculateShielding({
      initialIntensity: 100,
      linearAttenuationCoefficientPerCm: 0.5,
      thicknessCm: 2,
    });

    expect(result.halfValueLayerCm).toBeCloseTo(1.3863, 3);
    expect(result.transmittedIntensity).toBeCloseTo(36.79, 1);
    expect(result.percentAttenuated).toBeCloseTo(63.21, 1);
    expect(result.numberOfHvls).toBeCloseTo(1.4427, 3);
  });

  it("transmits exactly half the intensity at one HVL of thickness", () => {
    const result = calculateShielding({
      initialIntensity: 100,
      linearAttenuationCoefficientPerCm: 0.3,
      thicknessCm: Math.log(2) / 0.3, // exactly one HVL
    });
    expect(result.transmittedIntensity).toBeCloseTo(50, 3);
    expect(result.numberOfHvls).toBeCloseTo(1, 6);
  });

  it("attenuates more for a thicker shield", () => {
    const thin = calculateShielding({
      initialIntensity: 100,
      linearAttenuationCoefficientPerCm: 0.4,
      thicknessCm: 1,
    });
    const thick = calculateShielding({
      initialIntensity: 100,
      linearAttenuationCoefficientPerCm: 0.4,
      thicknessCm: 5,
    });
    expect(thick.transmittedIntensity).toBeLessThan(thin.transmittedIntensity);
  });
});
