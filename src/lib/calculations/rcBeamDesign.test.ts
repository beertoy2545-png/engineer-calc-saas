import { describe, expect, it } from "vitest";
import { calculateRcBeamDesign } from "./rcBeamDesign";

describe("calculateRcBeamDesign", () => {
  // Hand-calculated reference case (computed independently twice to
  // cross-check, since a web-sourced worked example turned out to contain
  // an internal arithmetic error and was discarded — see module comment).
  // b=300mm, d=450mm, f'c=25MPa, fy=400MPa, 3-D25 bars (As=1472.62 mm^2)
  it("matches a hand-calculated tension-controlled case", () => {
    const result = calculateRcBeamDesign({
      widthMm: 300,
      effectiveDepthMm: 450,
      fckMpa: 25,
      fyMpa: 400,
      barDiameterMm: 25,
      barCount: 3,
      designMomentKnm: 200,
    });

    expect(result.asMm2).toBeCloseTo(1472.62, 1);
    expect(result.beta1).toBeCloseTo(0.85, 3);
    expect(result.aMm).toBeCloseTo(92.4, 1);
    expect(result.cMm).toBeCloseTo(108.71, 1);
    expect(result.epsilonT).toBeCloseTo(0.00942, 4);
    expect(result.controlCase).toBe("tensionControlled");
    expect(result.phi).toBeCloseTo(0.9, 6);
    expect(result.nominalMomentKnm).toBeCloseTo(237.86, 1);
    expect(result.designMomentCapacityKnm).toBeCloseTo(214.07, 1);
    expect(result.rho).toBeCloseTo(0.010908, 5);
    expect(result.rhoMin).toBeCloseTo(0.0035, 4);
    expect(result.isAboveMinReinforcement).toBe(true);
    expect(result.isAdequate).toBe(true); // phiMn=214.07 >= Mu=200
  });

  it("flags an inadequate section when Mu exceeds phiMn", () => {
    const result = calculateRcBeamDesign({
      widthMm: 300,
      effectiveDepthMm: 450,
      fckMpa: 25,
      fyMpa: 400,
      barDiameterMm: 25,
      barCount: 3,
      designMomentKnm: 250, // > phiMn of 214.07
    });
    expect(result.isAdequate).toBe(false);
  });

  it("detects a compression-controlled section with heavy reinforcement", () => {
    // 6-D32 bars -> As=4825.5mm^2, heavily over-reinforced for this section
    const result = calculateRcBeamDesign({
      widthMm: 300,
      effectiveDepthMm: 450,
      fckMpa: 25,
      fyMpa: 400,
      barDiameterMm: 32,
      barCount: 6,
      designMomentKnm: 200,
    });
    expect(result.epsilonT).toBeLessThan(result.epsilonY);
    expect(result.controlCase).toBe("compressionControlled");
    expect(result.phi).toBeCloseTo(0.65, 6);
  });

  it("flags reinforcement below the code minimum", () => {
    // 2-D10 bars -> As=157.1mm^2, far below rho_min for this section
    const result = calculateRcBeamDesign({
      widthMm: 300,
      effectiveDepthMm: 450,
      fckMpa: 25,
      fyMpa: 400,
      barDiameterMm: 10,
      barCount: 2,
      designMomentKnm: 20,
    });
    expect(result.isAboveMinReinforcement).toBe(false);
  });

  it("uses the reduced beta1 for higher-strength concrete", () => {
    const result = calculateRcBeamDesign({
      widthMm: 300,
      effectiveDepthMm: 450,
      fckMpa: 42, // 28 + 14 -> beta1 = 0.85 - 0.05*2 = 0.75
      fyMpa: 400,
      barDiameterMm: 25,
      barCount: 3,
      designMomentKnm: 200,
    });
    expect(result.beta1).toBeCloseTo(0.75, 3);
  });
});
