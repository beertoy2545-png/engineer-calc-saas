import { describe, expect, it } from "vitest";
import {
  calculateBaseEnduranceLimit,
  calculateEnduranceLimit,
  calculateGoodmanSafetyFactor,
  calculateSizeFactor,
  calculateSurfaceFactor,
} from "./fatigueAnalysis";

describe("calculateSurfaceFactor", () => {
  // Both reproduced from an independently recomputed, source-verified
  // worked example (see module header comment for provenance).
  it("matches the verified Machined case (Sut=448 MPa -> ka=0.88)", () => {
    expect(calculateSurfaceFactor("machined", 448)).toBeCloseTo(0.88, 2);
  });

  it("matches the verified As-Forged case (Sut=1400 MPa -> ka=0.201)", () => {
    expect(calculateSurfaceFactor("asForged", 1400)).toBeCloseTo(0.201, 3);
  });

  it("never exceeds 1.0 even for a very low Sut", () => {
    expect(calculateSurfaceFactor("machined", 50)).toBeLessThanOrEqual(1);
  });

  it("uses the custom ka value directly when finish is custom", () => {
    expect(calculateSurfaceFactor("custom", 500, 0.95)).toBe(0.95);
  });
});

describe("calculateSizeFactor", () => {
  it("is exactly 1 for axial loading regardless of diameter", () => {
    expect(calculateSizeFactor("axial", 25)).toBe(1);
  });

  it("decreases as diameter increases, within the validated 2.79-51mm range", () => {
    const small = calculateSizeFactor("bending", 10);
    const large = calculateSizeFactor("bending", 40);
    expect(large).toBeLessThan(small);
    expect(small).toBeLessThan(1);
    expect(large).toBeGreaterThan(0);
  });

  it("falls back to 1 outside the validated diameter range", () => {
    expect(calculateSizeFactor("bending", 100)).toBe(1);
  });
});

describe("calculateBaseEnduranceLimit", () => {
  it("uses 0.504*Sut below the 1400 MPa threshold", () => {
    expect(calculateBaseEnduranceLimit(1000)).toBeCloseTo(504, 6);
  });

  it("caps at 700 MPa above the 1400 MPa threshold", () => {
    expect(calculateBaseEnduranceLimit(1600)).toBe(700);
  });
});

describe("calculateEnduranceLimit", () => {
  it("combines base, ka, kb, kc consistently", () => {
    const result = calculateEnduranceLimit({
      sutMpa: 448,
      loadType: "axial",
      surfaceFinish: "machined",
      diameterMm: 20,
    });
    expect(result.ka).toBeCloseTo(0.88, 2);
    expect(result.kb).toBe(1); // axial -> no size effect
    expect(result.kc).toBeCloseTo(0.85, 6);
    expect(result.correctedEnduranceLimitMpa).toBeCloseTo(
      result.ka * result.kb * result.kc * result.baseEnduranceLimitMpa,
      6,
    );
  });
});

describe("calculateGoodmanSafetyFactor", () => {
  // Hand-calculated: sigma_a=150, sigma_m=100, Se=300, Sut=600
  // utilization = 150/300 + 100/600 = 0.6667, Ns = 1.5
  it("matches a hand-calculated case", () => {
    const result = calculateGoodmanSafetyFactor({
      alternatingStressMpa: 150,
      meanStressMpa: 100,
      enduranceLimitMpa: 300,
      ultimateTensileMpa: 600,
    });
    expect(result.goodmanUtilization).toBeCloseTo(0.6667, 3);
    expect(result.safetyFactor).toBeCloseTo(1.5, 3);
    expect(result.isInfiniteLife).toBe(true);
  });

  it("flags finite (not infinite) life when the Goodman line is exceeded", () => {
    const result = calculateGoodmanSafetyFactor({
      alternatingStressMpa: 300,
      meanStressMpa: 300,
      enduranceLimitMpa: 300,
      ultimateTensileMpa: 600,
    });
    // utilization = 300/300 + 300/600 = 1.5 -> Ns = 0.667 < 1
    expect(result.safetyFactor).toBeLessThan(1);
    expect(result.isInfiniteLife).toBe(false);
  });
});
