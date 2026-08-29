import { describe, expect, it } from "vitest";
import { calculateCoolingLoad } from "./coolingLoad";

// Reference values verified against the live UI (browser check) for this
// exact input — locks in behavior so future edits can't silently change it.
describe("calculateCoolingLoad", () => {
  it("matches the verified reference case", () => {
    const result = calculateCoolingLoad({
      areaM2: 30,
      ceilingHeightM: 2.7,
      occupants: 4,
      lightingWattsPerM2: 12,
      equipmentWatts: 500,
      windowAreaM2: 6,
      glazingType: "single",
      outdoorTempC: 35,
      indoorTempC: 25,
      safetyFactorPct: 10,
    });

    expect(result.peopleLoadBtuH).toBeCloseTo(2000, 0);
    expect(result.lightingLoadBtuH).toBeCloseTo(1228, 0);
    expect(result.equipmentLoadBtuH).toBeCloseTo(1706, 0);
    expect(result.envelopeLoadBtuH).toBeCloseTo(3992, 0);
    expect(result.solarLoadBtuH).toBeCloseTo(8189, 0);
    expect(result.totalWithSafetyBtuH).toBeCloseTo(18827, 0);
    expect(result.totalTons).toBeCloseTo(1.57, 2);
    expect(result.recommendedBtuSize).toBe(24000);
  });

  it("recommends a larger standard AC size as load grows", () => {
    const small = calculateCoolingLoad({
      areaM2: 10,
      ceilingHeightM: 2.5,
      occupants: 1,
      lightingWattsPerM2: 10,
      equipmentWatts: 100,
      windowAreaM2: 1,
      glazingType: "double",
      outdoorTempC: 33,
      indoorTempC: 25,
      safetyFactorPct: 10,
    });
    const large = calculateCoolingLoad({
      areaM2: 200,
      ceilingHeightM: 3,
      occupants: 40,
      lightingWattsPerM2: 15,
      equipmentWatts: 5000,
      windowAreaM2: 50,
      glazingType: "single",
      outdoorTempC: 38,
      indoorTempC: 24,
      safetyFactorPct: 10,
    });
    expect(large.recommendedBtuSize).toBeGreaterThan(small.recommendedBtuSize);
  });
});
