import { describe, expect, it } from "vitest";
import { calculateSlopeStability } from "./slopeStability";

describe("calculateSlopeStability", () => {
  // Hand-calculated: c=15kPa, phi=30deg, gamma=18kN/m3, beta=25deg, z=4m
  // frictionTerm = tan30/tan25 = 1.2382, cohesionTerm = 0.5439, FS=1.7821
  it("matches a hand-calculated case", () => {
    const result = calculateSlopeStability({
      cohesionKpa: 15,
      frictionAngleDeg: 30,
      unitWeightKnM3: 18,
      slopeAngleDeg: 25,
      depthM: 4,
    });

    expect(result.frictionTermFs).toBeCloseTo(1.2382, 3);
    expect(result.cohesionTermFs).toBeCloseTo(0.5439, 3);
    expect(result.factorOfSafety).toBeCloseTo(1.7821, 3);
    expect(result.isStable).toBe(true);
    expect(result.meetsTypicalDesignMinimum).toBe(true);
  });

  it("reduces to tan(phi)/tan(beta) for a cohesionless soil, independent of depth", () => {
    const shallow = calculateSlopeStability({
      cohesionKpa: 0,
      frictionAngleDeg: 30,
      unitWeightKnM3: 18,
      slopeAngleDeg: 20,
      depthM: 2,
    });
    const deep = calculateSlopeStability({
      cohesionKpa: 0,
      frictionAngleDeg: 30,
      unitWeightKnM3: 18,
      slopeAngleDeg: 20,
      depthM: 20,
    });
    expect(shallow.factorOfSafety).toBeCloseTo(deep.factorOfSafety, 6);
    expect(shallow.factorOfSafety).toBeCloseTo(Math.tan((30 * Math.PI) / 180) / Math.tan((20 * Math.PI) / 180), 6);
  });

  it("is unstable (FS<1) for a cohesionless slope steeper than the friction angle", () => {
    const result = calculateSlopeStability({
      cohesionKpa: 0,
      frictionAngleDeg: 25,
      unitWeightKnM3: 18,
      slopeAngleDeg: 35, // beta > phi
      depthM: 3,
    });
    expect(result.factorOfSafety).toBeLessThan(1);
    expect(result.isStable).toBe(false);
  });

  it("increases FS for a deeper failure surface (cohesion contribution shrinks with depth)", () => {
    // More depth dilutes the cohesion term's relative contribution -> FS
    // approaches the pure friction ratio, which is lower here (illustrating
    // why cohesive slopes can fail at greater excavation depth even at the
    // same angle).
    const shallow = calculateSlopeStability({
      cohesionKpa: 20,
      frictionAngleDeg: 25,
      unitWeightKnM3: 18,
      slopeAngleDeg: 30,
      depthM: 2,
    });
    const deep = calculateSlopeStability({
      cohesionKpa: 20,
      frictionAngleDeg: 25,
      unitWeightKnM3: 18,
      slopeAngleDeg: 30,
      depthM: 20,
    });
    expect(deep.factorOfSafety).toBeLessThan(shallow.factorOfSafety);
  });
});
