import { describe, expect, it } from "vitest";
import {
  BETZ_LIMIT,
  calculateSolarSizing,
  calculateWindPower,
} from "./renewableEnergy";

describe("calculateSolarSizing", () => {
  // Hand-calculated: 20 kWh/day, PSH=5h, derating=0.8, 450W panels
  it("matches a hand-calculated case", () => {
    const result = calculateSolarSizing({
      dailyEnergyKwh: 20,
      peakSunHours: 5,
      deratingFactor: 0.8,
      panelWattage: 450,
    });

    expect(result.requiredArrayKw).toBeCloseTo(5, 6);
    expect(result.panelCount).toBe(12); // ceil(5000/450) = ceil(11.11) = 12
    expect(result.installedArrayKw).toBeCloseTo(5.4, 6);
  });

  it("requires more panels for a location with fewer peak sun hours", () => {
    const sunny = calculateSolarSizing({
      dailyEnergyKwh: 20,
      peakSunHours: 6,
      deratingFactor: 0.8,
      panelWattage: 450,
    });
    const cloudy = calculateSolarSizing({
      dailyEnergyKwh: 20,
      peakSunHours: 3.5,
      deratingFactor: 0.8,
      panelWattage: 450,
    });
    expect(cloudy.panelCount).toBeGreaterThan(sunny.panelCount);
  });
});

describe("calculateWindPower", () => {
  // Hand-calculated: rho=1.225, R=40m, v=10m/s, Cp=0.4
  it("matches a hand-calculated case", () => {
    const result = calculateWindPower({
      airDensityKgM3: 1.225,
      rotorRadiusM: 40,
      windSpeedMs: 10,
      powerCoefficient: 0.4,
    });

    expect(result.sweptAreaM2).toBeCloseTo(5026.55, 1);
    expect(result.powerW).toBeCloseTo(1231504, -1);
    expect(result.fractionOfBetzLimit).toBeCloseTo(0.6746, 3);
  });

  it("shows power scales with the cube of wind speed", () => {
    const base = calculateWindPower({
      airDensityKgM3: 1.225,
      rotorRadiusM: 40,
      windSpeedMs: 10,
      powerCoefficient: 0.4,
    });
    const doubled = calculateWindPower({
      airDensityKgM3: 1.225,
      rotorRadiusM: 40,
      windSpeedMs: 20,
      powerCoefficient: 0.4,
    });
    // Doubling wind speed should increase power by a factor of 2^3 = 8
    expect(doubled.powerW / base.powerW).toBeCloseTo(8, 2);
  });

  it("matches the Betz limit power exactly when Cp equals the Betz limit", () => {
    const result = calculateWindPower({
      airDensityKgM3: 1.225,
      rotorRadiusM: 40,
      windSpeedMs: 10,
      powerCoefficient: BETZ_LIMIT,
    });
    expect(result.powerW).toBeCloseTo(result.betzLimitPowerW, 6);
    expect(result.fractionOfBetzLimit).toBeCloseTo(1, 6);
  });
});
