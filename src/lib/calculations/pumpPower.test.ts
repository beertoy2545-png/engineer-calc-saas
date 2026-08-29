import { describe, expect, it } from "vitest";
import {
  atmPressureAtAltitude,
  calculateNpsh,
  calculatePumpHeadPower,
  vaporPressureAtTemp,
} from "./pumpPower";

describe("atmPressureAtAltitude / vaporPressureAtTemp", () => {
  it("matches the ME444 textbook lookup tables", () => {
    expect(atmPressureAtAltitude(1000)).toBeCloseTo(9.16, 2);
    expect(vaporPressureAtTemp(30)).toBeCloseTo(0.435, 3);
  });
});

describe("calculateNpsh", () => {
  // This reproduces the textbook's own worked Example 6.1 (Chapter 6):
  // DN80 steel, 600 lpm, 30°C water, site altitude 1000 m, z = 4 m.WA.,
  // 18 m suction run, +50% minor-loss margin -> book answer NPSHA = 3.195.
  // Our Darcy-Weisbach calc reproduces the book's chart-based friction
  // value (5.67 m/100m) closely enough that this stays within ~1%.
  it("reproduces the textbook's Example 6.1 answer within 1%", () => {
    const result = calculateNpsh({
      siteAltitudeM: 1000,
      waterTempC: 30,
      suctionStaticLiftM: 4,
      suctionMaterial: "steel",
      suctionPipeIdMm: 77.93,
      suctionLengthM: 18,
      suctionFlowLpm: 600,
      minorLossMarginPct: 50,
      npshRequiredM: 5,
    });

    expect(result.npshAvailableM).toBeCloseTo(3.195, 1);
    expect(result.hasCavitationRisk).toBe(true);
  });

  it("flags no cavitation risk when NPSHA comfortably exceeds NPSHR", () => {
    const result = calculateNpsh({
      siteAltitudeM: 0,
      waterTempC: 20,
      suctionStaticLiftM: -2, // flooded suction
      suctionMaterial: "steel",
      suctionPipeIdMm: 102.26,
      suctionLengthM: 5,
      suctionFlowLpm: 200,
      minorLossMarginPct: 30,
      npshRequiredM: 3,
    });
    expect(result.hasCavitationRisk).toBe(false);
  });
});

describe("calculatePumpHeadPower", () => {
  it("computes fluid/shaft/motor power per eq. 6.1-6.2", () => {
    const result = calculatePumpHeadPower({
      flowRateLpm: 600,
      staticHeadM: 15,
      frictionHeadLossM: 5,
      waterTempC: 30,
      designMarginPct: 10,
      pumpEfficiencyPct: 70,
      motorEfficiencyPct: 90,
    });

    expect(result.tdhM).toBeCloseTo(20, 1);
    expect(result.tdhWithMarginM).toBeCloseTo(22, 1);
    expect(result.motorInputPowerKw).toBeCloseTo(3.41, 1);
    expect(result.recommendedMotorKw).toBe(4);
  });
});
