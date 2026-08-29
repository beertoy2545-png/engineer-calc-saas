import { describe, expect, it } from "vitest";
import { calculateBraking } from "./vehicleDynamics";

describe("calculateBraking", () => {
  // Hand-calculated: v=100km/h, t_reaction=1.5s, mu=0.7, g=9.81,
  // m=1500kg, h_cg=0.5m, wheelbase=2.7m, 50/50 static distribution
  it("matches a hand-calculated case", () => {
    const result = calculateBraking({
      initialSpeedKmh: 100,
      reactionTimeS: 1.5,
      frictionCoefficient: 0.7,
      gravityMs2: 9.81,
      vehicleMassKg: 1500,
      cgHeightM: 0.5,
      wheelbaseM: 2.7,
      staticFrontWeightFraction: 0.5,
    });

    expect(result.initialSpeedMs).toBeCloseTo(27.778, 2);
    expect(result.decelerationMs2).toBeCloseTo(6.867, 2);
    expect(result.reactionDistanceM).toBeCloseTo(41.667, 1);
    expect(result.brakingDistanceM).toBeCloseTo(56.18, 1);
    expect(result.totalStoppingDistanceM).toBeCloseTo(97.85, 1);
    expect(result.weightTransferN).toBeCloseTo(1907.5, 0);
    expect(result.weightTransferKgEquivalent).toBeCloseTo(194.44, 1);

    const totalWeightN = 1500 * 9.81;
    expect(result.staticFrontLoadN).toBeCloseTo(totalWeightN / 2, 1);
    expect(result.dynamicFrontLoadN).toBeCloseTo(
      totalWeightN / 2 + result.weightTransferN,
      1,
    );
  });

  it("requires more stopping distance on a lower-friction (wet/icy) surface", () => {
    const dry = calculateBraking({
      initialSpeedKmh: 100,
      reactionTimeS: 1.5,
      frictionCoefficient: 0.8,
      gravityMs2: 9.81,
      vehicleMassKg: 1500,
      cgHeightM: 0.5,
      wheelbaseM: 2.7,
      staticFrontWeightFraction: 0.5,
    });
    const icy = calculateBraking({
      initialSpeedKmh: 100,
      reactionTimeS: 1.5,
      frictionCoefficient: 0.15,
      gravityMs2: 9.81,
      vehicleMassKg: 1500,
      cgHeightM: 0.5,
      wheelbaseM: 2.7,
      staticFrontWeightFraction: 0.5,
    });
    expect(icy.totalStoppingDistanceM).toBeGreaterThan(dry.totalStoppingDistanceM);
  });

  it("shows more weight transfer for a higher center of gravity (e.g. SUV vs sedan)", () => {
    const sedan = calculateBraking({
      initialSpeedKmh: 80,
      reactionTimeS: 1.0,
      frictionCoefficient: 0.7,
      gravityMs2: 9.81,
      vehicleMassKg: 1400,
      cgHeightM: 0.45,
      wheelbaseM: 2.6,
      staticFrontWeightFraction: 0.5,
    });
    const suv = calculateBraking({
      initialSpeedKmh: 80,
      reactionTimeS: 1.0,
      frictionCoefficient: 0.7,
      gravityMs2: 9.81,
      vehicleMassKg: 1400,
      cgHeightM: 0.7,
      wheelbaseM: 2.6,
      staticFrontWeightFraction: 0.5,
    });
    expect(suv.weightTransferN).toBeGreaterThan(sedan.weightTransferN);
  });
});
