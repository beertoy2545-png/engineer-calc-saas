import { describe, expect, it } from "vitest";
import { calculateCropWaterRequirement } from "./cropWaterRequirement";

describe("calculateCropWaterRequirement", () => {
  // Hand-calculated: ETo=5mm/day, Kc=1.2 (corn), no rain, FC=0.30,
  // WP=0.15, Zr=0.6m, MAD=0.5, efficiency=75%, area=1ha
  // ETc=6, TAW=90mm, RAW=45mm, interval=7.5 days, gross depth=60mm,
  // volume=600 m^3
  it("matches a hand-calculated case", () => {
    const result = calculateCropWaterRequirement({
      refEtoMmDay: 5,
      cropCoefficientKc: 1.2,
      effectiveRainfallMmDay: 0,
      fieldCapacityFrac: 0.3,
      wiltingPointFrac: 0.15,
      rootDepthM: 0.6,
      managementAllowedDepletion: 0.5,
      irrigationEfficiencyPct: 75,
      fieldAreaHa: 1,
    });

    expect(result.etcMmDay).toBeCloseTo(6, 6);
    expect(result.netIrrigationMmDay).toBeCloseTo(6, 6);
    expect(result.totalAvailableWaterMm).toBeCloseTo(90, 6);
    expect(result.readilyAvailableWaterMm).toBeCloseTo(45, 6);
    expect(result.irrigationIntervalDays).toBeCloseTo(7.5, 6);
    expect(result.grossIrrigationDepthMm).toBeCloseTo(60, 6);
    expect(result.irrigationVolumeM3).toBeCloseTo(600, 6);
  });

  it("reduces net irrigation requirement when there is effective rainfall", () => {
    const noRain = calculateCropWaterRequirement({
      refEtoMmDay: 5,
      cropCoefficientKc: 1.2,
      effectiveRainfallMmDay: 0,
      fieldCapacityFrac: 0.3,
      wiltingPointFrac: 0.15,
      rootDepthM: 0.6,
      managementAllowedDepletion: 0.5,
      irrigationEfficiencyPct: 75,
      fieldAreaHa: 1,
    });
    const withRain = calculateCropWaterRequirement({
      refEtoMmDay: 5,
      cropCoefficientKc: 1.2,
      effectiveRainfallMmDay: 3,
      fieldCapacityFrac: 0.3,
      wiltingPointFrac: 0.15,
      rootDepthM: 0.6,
      managementAllowedDepletion: 0.5,
      irrigationEfficiencyPct: 75,
      fieldAreaHa: 1,
    });
    expect(withRain.netIrrigationMmDay).toBeLessThan(noRain.netIrrigationMmDay);
    expect(withRain.netIrrigationMmDay).toBeCloseTo(3, 6); // 6 - 3
  });

  it("never gives a negative net irrigation requirement when rainfall exceeds ETc", () => {
    const result = calculateCropWaterRequirement({
      refEtoMmDay: 5,
      cropCoefficientKc: 1.2,
      effectiveRainfallMmDay: 20, // heavy rain, exceeds ETc
      fieldCapacityFrac: 0.3,
      wiltingPointFrac: 0.15,
      rootDepthM: 0.6,
      managementAllowedDepletion: 0.5,
      irrigationEfficiencyPct: 75,
      fieldAreaHa: 1,
    });
    expect(result.netIrrigationMmDay).toBe(0);
  });

  it("requires a shorter irrigation interval for a shallower root zone (less water storage)", () => {
    const deepRoots = calculateCropWaterRequirement({
      refEtoMmDay: 5,
      cropCoefficientKc: 1.2,
      effectiveRainfallMmDay: 0,
      fieldCapacityFrac: 0.3,
      wiltingPointFrac: 0.15,
      rootDepthM: 1.0,
      managementAllowedDepletion: 0.5,
      irrigationEfficiencyPct: 75,
      fieldAreaHa: 1,
    });
    const shallowRoots = calculateCropWaterRequirement({
      refEtoMmDay: 5,
      cropCoefficientKc: 1.2,
      effectiveRainfallMmDay: 0,
      fieldCapacityFrac: 0.3,
      wiltingPointFrac: 0.15,
      rootDepthM: 0.3,
      managementAllowedDepletion: 0.5,
      irrigationEfficiencyPct: 75,
      fieldAreaHa: 1,
    });
    expect(shallowRoots.irrigationIntervalDays).toBeLessThan(
      deepRoots.irrigationIntervalDays,
    );
  });
});
