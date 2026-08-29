import { describe, expect, it } from "vitest";
import {
  calculateSecondOrderResponse,
  calculateZieglerNicholsTuning,
} from "./controlSystems";

describe("calculateSecondOrderResponse", () => {
  // Hand-calculated reference: zeta=0.5, wn=10 rad/s
  it("matches a hand-calculated underdamped case", () => {
    const result = calculateSecondOrderResponse({
      naturalFreqRadS: 10,
      dampingRatio: 0.5,
    });

    expect(result.isUnderdamped).toBe(true);
    expect(result.dampedFreqRadS).toBeCloseTo(8.6603, 3);
    expect(result.delayTimeS).toBeCloseTo(0.135, 4);
    expect(result.riseTimeS).toBeCloseTo(0.2419, 3);
    expect(result.peakTimeS).toBeCloseTo(0.3628, 3);
    expect(result.percentOvershoot).toBeCloseTo(16.3, 1);
    expect(result.settlingTime2PctS).toBeCloseTo(0.8, 6);
    expect(result.settlingTime5PctS).toBeCloseTo(0.6, 6);
  });

  it("returns null overshoot/peak/rise time for a critically damped or overdamped system", () => {
    const critical = calculateSecondOrderResponse({
      naturalFreqRadS: 10,
      dampingRatio: 1,
    });
    expect(critical.isUnderdamped).toBe(false);
    expect(critical.percentOvershoot).toBeNull();
    expect(critical.peakTimeS).toBeNull();

    const overdamped = calculateSecondOrderResponse({
      naturalFreqRadS: 10,
      dampingRatio: 1.5,
    });
    expect(overdamped.isUnderdamped).toBe(false);
    expect(overdamped.percentOvershoot).toBeNull();
  });

  it("shows higher overshoot for lower damping ratio", () => {
    const lightDamped = calculateSecondOrderResponse({
      naturalFreqRadS: 10,
      dampingRatio: 0.2,
    });
    const heavyDamped = calculateSecondOrderResponse({
      naturalFreqRadS: 10,
      dampingRatio: 0.8,
    });
    expect(lightDamped.percentOvershoot!).toBeGreaterThan(heavyDamped.percentOvershoot!);
  });
});

describe("calculateZieglerNicholsTuning", () => {
  // Hand-calculated reference: Ku=8, Tu=2
  it("matches a hand-calculated tuning case", () => {
    const result = calculateZieglerNicholsTuning({
      ultimateGainKu: 8,
      ultimatePeriodTuS: 2,
    });

    expect(result.p.kp).toBeCloseTo(4.0, 6);
    expect(result.p.ti).toBeNull();

    expect(result.pi.kp).toBeCloseTo(3.6, 6);
    expect(result.pi.ti).toBeCloseTo(1.6667, 3);

    expect(result.pid.kp).toBeCloseTo(4.8, 6);
    expect(result.pid.ti).toBeCloseTo(1.0, 6);
    expect(result.pid.td).toBeCloseTo(0.25, 6);
  });
});
