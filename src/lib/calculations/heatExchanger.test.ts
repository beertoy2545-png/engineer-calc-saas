import { describe, expect, it } from "vitest";
import { calculateHeatExchanger } from "./heatExchanger";

describe("calculateHeatExchanger", () => {
  const baseTemps = { thInC: 90, thOutC: 60, tcInC: 20, tcOutC: 45 };

  it("matches a hand-calculated counterflow case", () => {
    // dT1 = 90-45 = 45, dT2 = 60-20 = 40
    // LMTD = (45-40)/ln(45/40) = 42.45, A = 500,000/(2000*42.45) = 5.89 m^2
    const result = calculateHeatExchanger({
      flowArrangement: "counterflow",
      ...baseTemps,
      heatDutyKw: 500,
      overallUWm2k: 2000,
    });

    expect(result.deltaT1).toBeCloseTo(45, 1);
    expect(result.deltaT2).toBeCloseTo(40, 1);
    expect(result.lmtdC).toBeCloseTo(42.45, 1);
    expect(result.requiredAreaM2).toBeCloseTo(5.89, 1);
    expect(result.isThermodynamicallyValid).toBe(true);
  });

  it("matches a hand-calculated parallel-flow case and requires more area than counterflow", () => {
    // dT1 = 90-20 = 70, dT2 = 60-45 = 15
    // LMTD = (70-15)/ln(70/15) = 35.71, A = 500,000/(2000*35.71) = 7.00 m^2
    const result = calculateHeatExchanger({
      flowArrangement: "parallel",
      ...baseTemps,
      heatDutyKw: 500,
      overallUWm2k: 2000,
    });

    expect(result.deltaT1).toBeCloseTo(70, 1);
    expect(result.deltaT2).toBeCloseTo(15, 1);
    expect(result.lmtdC).toBeCloseTo(35.71, 1);
    expect(result.requiredAreaM2).toBeCloseTo(7.0, 1);
  });

  it("handles the dT1 == dT2 limiting case without dividing by zero", () => {
    const result = calculateHeatExchanger({
      flowArrangement: "counterflow",
      thInC: 90,
      thOutC: 60,
      tcInC: 20,
      tcOutC: 50, // dT1 = 90-50=40, dT2 = 60-20=40 -> equal
      heatDutyKw: 100,
      overallUWm2k: 1000,
    });
    expect(result.lmtdC).toBeCloseTo(40, 2);
    expect(Number.isFinite(result.requiredAreaM2)).toBe(true);
  });

  it("flags a thermodynamically invalid temperature crossover", () => {
    const result = calculateHeatExchanger({
      flowArrangement: "counterflow",
      thInC: 40,
      thOutC: 35,
      tcInC: 30,
      tcOutC: 45, // cold outlet hotter than hot inlet -> impossible for counterflow here
      heatDutyKw: 100,
      overallUWm2k: 1000,
    });
    expect(result.isThermodynamicallyValid).toBe(false);
    expect(Number.isNaN(result.requiredAreaM2)).toBe(true);
  });
});
