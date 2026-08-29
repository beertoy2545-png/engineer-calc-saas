import { describe, expect, it } from "vitest";
import { calculateClarifierDesign } from "./clarifierDesign";

describe("calculateClarifierDesign", () => {
  // Hand-calculated reference: secondary clarifier, circular D=12m,
  // depth=4m, Q=5000 m3/day, peaking factor 2.5
  it("matches a hand-calculated circular secondary clarifier case", () => {
    const result = calculateClarifierDesign({
      clarifierType: "secondary",
      avgFlowM3Day: 5000,
      peakingFactor: 2.5,
      shape: "circular",
      diameterM: 12,
      depthM: 4,
    });

    expect(result.areaM2).toBeCloseTo(113.097, 2);
    expect(result.weirLengthM).toBeCloseTo(37.699, 2);
    expect(result.volumeM3).toBeCloseTo(452.389, 1);
    expect(result.sorM3M2Day).toBeCloseTo(44.21, 1);
    expect(result.peakSorM3M2Day).toBeCloseTo(110.52, 1);
    expect(result.hrtHours).toBeCloseTo(2.1715, 3);
    expect(result.weirLoadingM3DayPerM).toBeCloseTo(132.63, 1);

    expect(result.isSorInRange).toBe(true);
    expect(result.isPeakSorOk).toBe(true);
    expect(result.isHrtInRange).toBe(true);
    expect(result.isWeirLoadingOk).toBe(true);

    // recommended area range for secondary: Q/49 to Q/24
    expect(result.recommendedAreaMinM2).toBeCloseTo(102.04, 1);
    expect(result.recommendedAreaMaxM2).toBeCloseTo(208.33, 1);
  });

  it("flags an undersized tank (SOR above the recommended max)", () => {
    const result = calculateClarifierDesign({
      clarifierType: "primary",
      avgFlowM3Day: 10000,
      peakingFactor: 2,
      shape: "circular",
      diameterM: 10, // small tank for this flow -> high SOR
      depthM: 3,
    });
    expect(result.isSorInRange).toBe(false);
    expect(result.sorM3M2Day).toBeGreaterThan(48);
  });

  it("computes rectangular tank area and weir length correctly", () => {
    const result = calculateClarifierDesign({
      clarifierType: "primary",
      avgFlowM3Day: 3000,
      peakingFactor: 2,
      shape: "rectangular",
      lengthM: 20,
      widthM: 6,
      depthM: 3,
    });
    expect(result.areaM2).toBe(120);
    expect(result.weirLengthM).toBe(6);
    expect(result.volumeM3).toBe(360);
  });
});
