import { describe, expect, it } from "vitest";
import {
  EARTH_MU_M3S2,
  EARTH_RADIUS_M,
  calculateOrbitalMechanics,
  calculateRocketEquation,
} from "./aerospace";

describe("calculateRocketEquation", () => {
  // Hand-calculated: Isp=311s (kerolox-class), m0=500,000kg, mf=50,000kg
  it("matches a hand-calculated case", () => {
    const result = calculateRocketEquation({
      specificImpulseS: 311,
      wetMassKg: 500000,
      dryMassKg: 50000,
    });

    expect(result.exhaustVelocityMs).toBeCloseTo(3049.87, 1);
    expect(result.massRatio).toBeCloseTo(10, 6);
    expect(result.propellantMassKg).toBe(450000);
    expect(result.propellantMassFraction).toBeCloseTo(0.9, 6);
    expect(result.deltaVMs).toBeCloseTo(7022.6, 0);
  });

  it("gives zero delta-v when wet mass equals dry mass (no propellant)", () => {
    const result = calculateRocketEquation({
      specificImpulseS: 300,
      wetMassKg: 1000,
      dryMassKg: 1000,
    });
    expect(result.deltaVMs).toBeCloseTo(0, 6);
  });
});

describe("calculateOrbitalMechanics", () => {
  // Reference: ISS-like circular orbit, 400km altitude above Earth.
  // Expected orbital velocity ~7.67 km/s, period ~92.4 min — matches the
  // real ISS's known orbital parameters as an independent sanity check.
  it("matches a hand-calculated 400km circular Earth orbit", () => {
    const result = calculateOrbitalMechanics({
      centralBodyMuM3S2: EARTH_MU_M3S2,
      centralBodyRadiusM: EARTH_RADIUS_M,
      altitudeM: 400000,
    });

    expect(result.orbitalRadiusM).toBe(6771000);
    expect(result.orbitalVelocityMs).toBeCloseTo(7672.6, -1);
    expect(result.orbitalPeriodS).toBeCloseTo(5547, -1);
    expect(result.escapeVelocityMs).toBeCloseTo(result.orbitalVelocityMs * Math.SQRT2, 1);
  });

  it("gives a higher orbital velocity for a lower orbit", () => {
    const low = calculateOrbitalMechanics({
      centralBodyMuM3S2: EARTH_MU_M3S2,
      centralBodyRadiusM: EARTH_RADIUS_M,
      altitudeM: 200000,
    });
    const high = calculateOrbitalMechanics({
      centralBodyMuM3S2: EARTH_MU_M3S2,
      centralBodyRadiusM: EARTH_RADIUS_M,
      altitudeM: 35786000, // geostationary-ish altitude
    });
    expect(low.orbitalVelocityMs).toBeGreaterThan(high.orbitalVelocityMs);
    expect(low.orbitalPeriodS).toBeLessThan(high.orbitalPeriodS);
  });

  it("gives a geostationary-altitude orbit a period close to 24 hours", () => {
    const result = calculateOrbitalMechanics({
      centralBodyMuM3S2: EARTH_MU_M3S2,
      centralBodyRadiusM: EARTH_RADIUS_M,
      altitudeM: 35786000,
    });
    // Sidereal day is ~86164s; geostationary altitude is defined by this,
    // so the computed period should land very close to it.
    expect(result.orbitalPeriodS).toBeCloseTo(86164, -2);
  });
});
