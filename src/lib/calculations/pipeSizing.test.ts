import { describe, expect, it } from "vitest";
import { calculatePipeSizing, waterPropertiesAt } from "./pipeSizing";

describe("waterPropertiesAt", () => {
  it("matches the ME444 reference table at 20°C", () => {
    const { rho } = waterPropertiesAt(20);
    expect(rho).toBeCloseTo(998.2, 1);
  });

  it("clamps outside the table range instead of extrapolating", () => {
    const low = waterPropertiesAt(-10);
    const high = waterPropertiesAt(150);
    expect(low.rho).toBeCloseTo(1000.0, 1);
    expect(high.rho).toBeCloseTo(958.4, 1);
  });
});

describe("calculatePipeSizing", () => {
  const baseInput = {
    flowRateLpm: 200,
    material: "steel" as const,
    waterTempC: 20,
    pipeLengthM: 30,
    application: "coldWater" as const,
    fittingCounts: { elbow90std: 4, gateValve: 2, checkValve: 1 },
  };

  it("matches the verified reference case (200 LPM steel, 30m)", () => {
    const output = calculatePipeSizing(baseInput);
    const recommended = output.results[output.recommendedIndex];

    expect(recommended.size.label).toBe('1-1/2" (DN40)');
    expect(recommended.velocityMs).toBeCloseTo(2.54, 1);
    expect(recommended.reynolds).toBeCloseTo(103375, -3);
    expect(recommended.totalHeadLossM).toBeCloseTo(7.6, 1);
  });

  it("increases head loss for a longer pipe run", () => {
    const short = calculatePipeSizing(baseInput);
    const long = calculatePipeSizing({ ...baseInput, pipeLengthM: 300 });
    const shortLoss = short.results[short.recommendedIndex].totalHeadLossM;
    const longLoss = long.results[long.recommendedIndex].totalHeadLossM;
    expect(longLoss).toBeGreaterThan(shortLoss);
  });

  it("flags laminar flow at very low Reynolds number", () => {
    const output = calculatePipeSizing({
      ...baseInput,
      flowRateLpm: 0.5,
      application: "custom",
      customVelocityMin: 0,
      customVelocityMax: 10,
    });
    const smallestPipe = output.results[0];
    expect(smallestPipe.reynolds).toBeLessThan(2300);
    expect(smallestPipe.flowRegime).toBe("laminar");
  });
});
