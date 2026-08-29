import { describe, expect, it } from "vitest";
import { calculateShipStability } from "./shipStability";

describe("calculateShipStability", () => {
  // Hand-calculated: L=50m, B=10m, T=3m, KG=4m, seawater
  // V=1500 m^3, KB=1.5m, I=4166.67 m^4, BM=2.778m, GM=0.278m
  it("matches a hand-calculated box-hull case", () => {
    const result = calculateShipStability({
      lengthM: 50,
      beamM: 10,
      draftM: 3,
      kgM: 4,
      waterDensityTM3: 1.025,
    });

    expect(result.displacementVolumeM3).toBe(1500);
    expect(result.displacementTonnes).toBeCloseTo(1537.5, 6);
    expect(result.kbM).toBeCloseTo(1.5, 6);
    expect(result.bmM).toBeCloseTo(2.7778, 3);
    expect(result.kmM).toBeCloseTo(4.2778, 3);
    expect(result.gmM).toBeCloseTo(0.2778, 3);
    expect(result.isStable).toBe(true);
    expect(result.meetsImoMinimum).toBe(true);
  });

  it("flags instability (negative GM) for a top-heavy vessel", () => {
    const result = calculateShipStability({
      lengthM: 50,
      beamM: 10,
      draftM: 3,
      kgM: 6, // much higher center of gravity
      waterDensityTM3: 1.025,
    });
    expect(result.gmM).toBeLessThan(0);
    expect(result.isStable).toBe(false);
    expect(result.meetsImoMinimum).toBe(false);
  });

  it("shows a wider beam increases GM (more initial stability)", () => {
    const narrow = calculateShipStability({
      lengthM: 50,
      beamM: 8,
      draftM: 3,
      kgM: 4,
      waterDensityTM3: 1.025,
    });
    const wide = calculateShipStability({
      lengthM: 50,
      beamM: 14,
      draftM: 3,
      kgM: 4,
      waterDensityTM3: 1.025,
    });
    expect(wide.gmM).toBeGreaterThan(narrow.gmM);
  });
});
