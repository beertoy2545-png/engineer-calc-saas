import { describe, expect, it } from "vitest";
import { calculateShaftDesign } from "./shaftDesign";

describe("calculateShaftDesign", () => {
  // Matches the verified reference case from the live UI / hand calculation:
  // 5 kW @ 1450 rpm, M = 80 N·m, AISI 1040 (Sy=350, Sut=520), keyway, kb=1.5, kt=1.0
  it("matches the verified reference case", () => {
    const result = calculateShaftDesign({
      powerKw: 5,
      speedRpm: 1450,
      bendingMomentNm: 80,
      syMpa: 350,
      sutMpa: 520,
      hasKeyway: true,
      kb: 1.5,
      kt: 1.0,
    });

    expect(result.torqueNm).toBeCloseTo(32.93, 1);
    expect(result.tauAllowMpaRaw).toBeCloseTo(93.6, 1);
    expect(result.tauAllowMpa).toBeCloseTo(41, 1);
    expect(result.cappedByCode).toBe(true);
    expect(result.requiredDiameterMm).toBeCloseTo(24.91, 1);
    expect(result.recommendedDiameterMm).toBe(25);
  });

  it("applies the 55 MPa steel code cap when there is no keyway", () => {
    const result = calculateShaftDesign({
      powerKw: 1,
      speedRpm: 1000,
      bendingMomentNm: 1,
      syMpa: 1000,
      sutMpa: 1500,
      hasKeyway: false,
      kb: 1.0,
      kt: 1.0,
    });
    expect(result.tauAllowMpa).toBe(55);
    expect(result.cappedByCode).toBe(true);
  });

  it("requires a larger diameter for higher torque", () => {
    const low = calculateShaftDesign({
      powerKw: 2,
      speedRpm: 1450,
      bendingMomentNm: 20,
      syMpa: 350,
      sutMpa: 520,
      hasKeyway: true,
      kb: 1.5,
      kt: 1.0,
    });
    const high = calculateShaftDesign({
      powerKw: 20,
      speedRpm: 1450,
      bendingMomentNm: 200,
      syMpa: 350,
      sutMpa: 520,
      hasKeyway: true,
      kb: 1.5,
      kt: 1.0,
    });
    expect(high.requiredDiameterMm).toBeGreaterThan(low.requiredDiameterMm);
  });
});
