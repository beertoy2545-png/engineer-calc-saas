import { describe, expect, it } from "vitest";
import { calculateBeamAnalysis, calculateDeflectionCurve } from "./beamAnalysis";

describe("calculateBeamAnalysis", () => {
  it("matches a hand-calculated simply supported center point load case", () => {
    // b=100mm, h=200mm rectangular, L=4m, P=10kN, E=200GPa (steel)
    // I = 66,666,667 mm^4, Mmax = 10,000,000 N.mm, sigma = 15.0 MPa, d = 1.0 mm
    const result = calculateBeamAnalysis({
      supportType: "simplySupported",
      loadType: "point",
      pointLoadKn: 10,
      udlKnPerM: 0,
      spanM: 4,
      elasticModulusGpa: 200,
      crossSection: { type: "rectangular", widthMm: 100, heightMm: 200 },
      yieldStrengthMpa: 250,
      safetyFactor: 1.67,
      deflectionLimitDenominator: 360,
    });

    expect(result.iMm4).toBeCloseTo(66666667, -2);
    expect(result.maxMomentNmm).toBeCloseTo(10_000_000, 0);
    expect(result.maxBendingStressMpa).toBeCloseTo(15.0, 1);
    expect(result.maxDeflectionMm).toBeCloseTo(1.0, 2);
    expect(result.deflectionLimitMm).toBeCloseTo(11.11, 1);
    expect(result.stressOk).toBe(true);
    expect(result.deflectionOk).toBe(true);
  });

  it("matches a hand-calculated cantilever UDL case", () => {
    // b=150mm, h=300mm rectangular, L=3m, w=5kN/m, E=200GPa
    // I = 337,500,000 mm^4, Mmax = 22,500,000 N.mm, sigma = 10.0 MPa, d = 0.75 mm
    const result = calculateBeamAnalysis({
      supportType: "cantilever",
      loadType: "udl",
      pointLoadKn: 0,
      udlKnPerM: 5,
      spanM: 3,
      elasticModulusGpa: 200,
      crossSection: { type: "rectangular", widthMm: 150, heightMm: 300 },
      yieldStrengthMpa: 250,
      safetyFactor: 1.67,
      deflectionLimitDenominator: 360,
    });

    expect(result.iMm4).toBeCloseTo(337_500_000, -2);
    expect(result.maxMomentNmm).toBeCloseTo(22_500_000, 0);
    expect(result.maxBendingStressMpa).toBeCloseTo(10.0, 1);
    expect(result.maxDeflectionMm).toBeCloseTo(0.75, 2);
  });

  it("computes a circular section's moment of inertia correctly", () => {
    const result = calculateBeamAnalysis({
      supportType: "simplySupported",
      loadType: "point",
      pointLoadKn: 1,
      udlKnPerM: 0,
      spanM: 1,
      elasticModulusGpa: 200,
      crossSection: { type: "circular", diameterMm: 50 },
      yieldStrengthMpa: 250,
      safetyFactor: 1.67,
      deflectionLimitDenominator: 360,
    });
    // I = pi*d^4/64 = pi*50^4/64 = 306,796 mm^4 (approx)
    expect(result.iMm4).toBeCloseTo(306796, -2);
    expect(result.cMm).toBe(25);
  });

  it("flags stress failure when the beam is under-sized", () => {
    const result = calculateBeamAnalysis({
      supportType: "simplySupported",
      loadType: "point",
      pointLoadKn: 500,
      udlKnPerM: 0,
      spanM: 4,
      elasticModulusGpa: 200,
      crossSection: { type: "rectangular", widthMm: 50, heightMm: 50 },
      yieldStrengthMpa: 250,
      safetyFactor: 1.67,
      deflectionLimitDenominator: 360,
    });
    expect(result.stressOk).toBe(false);
  });
});

describe("calculateDeflectionCurve", () => {
  const ssPointInput = {
    supportType: "simplySupported" as const,
    loadType: "point" as const,
    pointLoadKn: 10,
    udlKnPerM: 0,
    spanM: 4,
    elasticModulusGpa: 200,
    crossSection: { type: "rectangular" as const, widthMm: 100, heightMm: 200 },
    yieldStrengthMpa: 250,
    safetyFactor: 1.67,
    deflectionLimitDenominator: 360,
  };

  it("has zero deflection at both supports (simply supported)", () => {
    const points = calculateDeflectionCurve(ssPointInput);
    expect(points[0].yMm).toBeCloseTo(0, 6);
    expect(points[points.length - 1].yMm).toBeCloseTo(0, 6);
  });

  it("peaks at midspan matching the already-validated max deflection (simply supported, point load)", () => {
    const points = calculateDeflectionCurve(ssPointInput, 41); // odd count -> exact midpoint sample
    const result = calculateBeamAnalysis(ssPointInput);
    const mid = points[(points.length - 1) / 2];
    expect(mid.xMm).toBeCloseTo(2000, 6); // L/2 in mm
    expect(mid.yMm).toBeCloseTo(result.maxDeflectionMm, 3);
  });

  it("peaks at the free end matching the already-validated max deflection (cantilever, UDL)", () => {
    const cantileverUdlInput = {
      supportType: "cantilever" as const,
      loadType: "udl" as const,
      pointLoadKn: 0,
      udlKnPerM: 5,
      spanM: 3,
      elasticModulusGpa: 200,
      crossSection: { type: "rectangular" as const, widthMm: 150, heightMm: 300 },
      yieldStrengthMpa: 250,
      safetyFactor: 1.67,
      deflectionLimitDenominator: 360,
    };
    const points = calculateDeflectionCurve(cantileverUdlInput);
    const result = calculateBeamAnalysis(cantileverUdlInput);
    expect(points[0].yMm).toBeCloseTo(0, 6); // fixed end
    expect(points[points.length - 1].yMm).toBeCloseTo(result.maxDeflectionMm, 3);
  });
});
