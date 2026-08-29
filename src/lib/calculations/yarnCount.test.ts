import { describe, expect, it } from "vitest";
import {
  calculateFabricAreaDensity,
  convertYarnCount,
  NE_TO_TEX_CONSTANT,
} from "./yarnCount";

describe("NE_TO_TEX_CONSTANT", () => {
  it("derives to approximately the commonly cited 590.5 value", () => {
    expect(NE_TO_TEX_CONSTANT).toBeCloseTo(590.5, 0);
  });
});

describe("convertYarnCount", () => {
  it("converts a common cotton count (Ne 30) to Tex correctly", () => {
    const result = convertYarnCount(30, "ne");
    expect(result.tex).toBeCloseTo(NE_TO_TEX_CONSTANT / 30, 6);
    expect(result.tex).toBeCloseTo(19.68, 1);
  });

  it("matches a hand-calculated Tex-to-Denier/Nm case (Tex=20)", () => {
    const result = convertYarnCount(20, "tex");
    expect(result.denier).toBeCloseTo(180, 6); // 20*9
    expect(result.nm).toBeCloseTo(50, 6); // 1000/20
  });

  it("round-trips through Tex without drift", () => {
    const value = 42;
    const asTex = convertYarnCount(value, "denier");
    const backToDenier = convertYarnCount(asTex.tex, "tex");
    expect(backToDenier.denier).toBeCloseTo(value, 6);
  });

  it("shows a finer yarn has a higher Ne but lower Tex (indirect vs direct system)", () => {
    const coarse = convertYarnCount(10, "ne");
    const fine = convertYarnCount(60, "ne");
    expect(fine.tex).toBeLessThan(coarse.tex);
  });
});

describe("calculateFabricAreaDensity", () => {
  // Hand-calculated: 10cm x 10cm swatch (0.01 m^2) weighing 1.5g,
  // fabric width 1.5m
  it("matches a hand-calculated case", () => {
    const result = calculateFabricAreaDensity({
      sampleMassG: 1.5,
      sampleAreaM2: 0.01,
      fabricWidthM: 1.5,
    });
    expect(result.gsm).toBeCloseTo(150, 6);
    expect(result.linearWeightGM).toBeCloseTo(225, 6);
    expect(result.linearWeightKgM).toBeCloseTo(0.225, 6);
  });
});
