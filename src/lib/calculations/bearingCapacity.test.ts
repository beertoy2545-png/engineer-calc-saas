import { describe, expect, it } from "vitest";
import {
  calculateBearingCapacity,
  calculateBearingFactors,
} from "./bearingCapacity";

describe("calculateBearingFactors", () => {
  // Cross-checked against a published Nc/Nq/Ngamma table (Meyerhof Nq/Nc,
  // Hansen Ngamma) at multiple friction angles before implementation.
  it("matches the published table at phi=30 degrees", () => {
    const f = calculateBearingFactors(30);
    expect(f.nq).toBeCloseTo(18.4, 1);
    expect(f.nc).toBeCloseTo(30.14, 1);
    expect(f.ngamma).toBeCloseTo(22.4, 1);
  });

  it("matches the published table at phi=20 degrees", () => {
    const f = calculateBearingFactors(20);
    expect(f.nq).toBeCloseTo(6.4, 1);
    expect(f.nc).toBeCloseTo(14.83, 1);
    expect(f.ngamma).toBeCloseTo(5.39, 1);
  });

  it("matches the phi=0 limiting case (Nc=pi+2, Nq=1, Ngamma=0)", () => {
    const f = calculateBearingFactors(0);
    expect(f.nc).toBeCloseTo(5.14, 2);
    expect(f.nq).toBe(1);
    expect(f.ngamma).toBe(0);
  });
});

describe("calculateBearingCapacity", () => {
  // Hand-calculated: phi=30deg (Nc=30.14, Nq=18.40, Ngamma=22.40),
  // c=20kPa, q=15kPa, gamma=18kN/m3, B=1.5m, strip footing, FS=3
  it("matches a hand-calculated strip footing case", () => {
    const result = calculateBearingCapacity({
      frictionAngleDeg: 30,
      cohesionKpa: 20,
      surchargeKpa: 15,
      soilUnitWeightKnM3: 18,
      footingWidthM: 1.5,
      shape: "strip",
      factorOfSafety: 3,
    });

    expect(result.cohesionTermKpa).toBeCloseTo(602.8, 0);
    expect(result.surchargeTermKpa).toBeCloseTo(276, 0);
    expect(result.weightTermKpa).toBeCloseTo(302.4, 0);
    expect(result.ultimateBearingCapacityKpa).toBeCloseTo(1181.2, 0);
    expect(result.allowableBearingCapacityKpa).toBeCloseTo(393.7, 0);
  });

  it("gives a square footing a higher cohesion-term contribution but a lower self-weight-term contribution than a strip footing", () => {
    // Shape factors are 1.3 on the cohesion term (increases it) but only
    // 0.4 on the self-weight term (reduces it) — a real, documented
    // effect of 3D footing shape, not a uniform ">1 always" multiplier.
    const strip = calculateBearingCapacity({
      frictionAngleDeg: 30,
      cohesionKpa: 20,
      surchargeKpa: 15,
      soilUnitWeightKnM3: 18,
      footingWidthM: 1.5,
      shape: "strip",
      factorOfSafety: 3,
    });
    const square = calculateBearingCapacity({
      frictionAngleDeg: 30,
      cohesionKpa: 20,
      surchargeKpa: 15,
      soilUnitWeightKnM3: 18,
      footingWidthM: 1.5,
      shape: "square",
      factorOfSafety: 3,
    });
    expect(square.cohesionTermKpa).toBeGreaterThan(strip.cohesionTermKpa);
    expect(square.weightTermKpa).toBeLessThan(strip.weightTermKpa);
  });

  it("gives a cohesionless soil's square footing a lower capacity than a strip footing", () => {
    // With no cohesion term to offset it, the reduced (0.4x) self-weight
    // shape factor should make the square footing's capacity strictly lower.
    const strip = calculateBearingCapacity({
      frictionAngleDeg: 30,
      cohesionKpa: 0,
      surchargeKpa: 15,
      soilUnitWeightKnM3: 18,
      footingWidthM: 1.5,
      shape: "strip",
      factorOfSafety: 3,
    });
    const square = calculateBearingCapacity({
      frictionAngleDeg: 30,
      cohesionKpa: 0,
      surchargeKpa: 15,
      soilUnitWeightKnM3: 18,
      footingWidthM: 1.5,
      shape: "square",
      factorOfSafety: 3,
    });
    expect(square.ultimateBearingCapacityKpa).toBeLessThan(
      strip.ultimateBearingCapacityKpa,
    );
  });

  it("reduces to pure cohesion + surcharge terms for undrained clay (phi=0)", () => {
    const result = calculateBearingCapacity({
      frictionAngleDeg: 0,
      cohesionKpa: 50,
      surchargeKpa: 20,
      soilUnitWeightKnM3: 18,
      footingWidthM: 2,
      shape: "strip",
      factorOfSafety: 3,
    });
    expect(result.weightTermKpa).toBe(0);
    expect(result.ultimateBearingCapacityKpa).toBeCloseTo(50 * (Math.PI + 2) + 20 * 1, 6);
  });
});
