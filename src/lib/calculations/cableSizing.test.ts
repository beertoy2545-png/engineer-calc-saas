import { describe, expect, it } from "vitest";
import {
  ambientTempFactor,
  calculateCableSizing,
  groupingFactor,
} from "./cableSizing";

describe("ambientTempFactor / groupingFactor", () => {
  it("matches IEC 60364-5-52 Table B.52.14 / B.52.17 reference points", () => {
    expect(ambientTempFactor(30)).toBeCloseTo(1.0, 2);
    expect(ambientTempFactor(40)).toBeCloseTo(0.87, 2);
    expect(groupingFactor(1)).toBeCloseTo(1.0, 2);
    expect(groupingFactor(9)).toBeCloseTo(0.5, 2);
  });
});

describe("calculateCableSizing", () => {
  // Hand-calculated reference case: 30 kW three-phase load, 400V, pf 0.9,
  // method C, 30°C ambient (Ca=1), single circuit (Cg=1), 50 m run.
  it("matches a hand-calculated reference case", () => {
    const output = calculateCableSizing({
      phase: "three",
      loadPowerKw: 30,
      voltageV: 400,
      powerFactor: 0.9,
      installMethod: "C",
      ambientTempC: 30,
      groupedCircuits: 1,
      lengthM: 50,
      maxVoltageDropPct: 5,
    });

    expect(output.designCurrentA).toBeCloseTo(48.11, 1);
    expect(output.ambientFactor).toBeCloseTo(1.0, 2);
    expect(output.groupFactor).toBeCloseTo(1.0, 2);

    const recommended = output.results[output.recommendedIndex];
    expect(recommended.crossSectionMm2).toBe(10);
    expect(recommended.voltageDropPct).toBeCloseTo(1.93, 1);
    expect(recommended.suitable).toBe(true);
  });

  it("rejects a cable size whose ampacity is too low even at 0% voltage drop tolerance", () => {
    const output = calculateCableSizing({
      phase: "three",
      loadPowerKw: 30,
      voltageV: 400,
      powerFactor: 0.9,
      installMethod: "C",
      ambientTempC: 30,
      groupedCircuits: 1,
      lengthM: 50,
      maxVoltageDropPct: 5,
    });
    const sixMm2 = output.results.find((r) => r.crossSectionMm2 === 6)!;
    expect(sixMm2.ampacityOk).toBe(false);
    expect(sixMm2.suitable).toBe(false);
  });

  it("requires a larger cable when circuits are bunched together", () => {
    const single = calculateCableSizing({
      phase: "three",
      loadPowerKw: 30,
      voltageV: 400,
      powerFactor: 0.9,
      installMethod: "C",
      ambientTempC: 30,
      groupedCircuits: 1,
      lengthM: 50,
      maxVoltageDropPct: 5,
    });
    const grouped = calculateCableSizing({
      phase: "three",
      loadPowerKw: 30,
      voltageV: 400,
      powerFactor: 0.9,
      installMethod: "C",
      ambientTempC: 30,
      groupedCircuits: 9,
      lengthM: 50,
      maxVoltageDropPct: 5,
    });
    const singleSize = single.results[single.recommendedIndex].crossSectionMm2;
    const groupedSize = grouped.results[grouped.recommendedIndex].crossSectionMm2;
    expect(groupedSize).toBeGreaterThan(singleSize);
  });

  it("requires a larger cable for a longer run due to voltage drop", () => {
    const short = calculateCableSizing({
      phase: "single",
      loadPowerKw: 3,
      voltageV: 230,
      powerFactor: 1,
      installMethod: "B1",
      ambientTempC: 30,
      groupedCircuits: 1,
      lengthM: 10,
      maxVoltageDropPct: 3,
    });
    const long = calculateCableSizing({
      phase: "single",
      loadPowerKw: 3,
      voltageV: 230,
      powerFactor: 1,
      installMethod: "B1",
      ambientTempC: 30,
      groupedCircuits: 1,
      lengthM: 100,
      maxVoltageDropPct: 3,
    });
    const shortSize = short.results[short.recommendedIndex].crossSectionMm2;
    const longSize = long.results[long.recommendedIndex].crossSectionMm2;
    expect(longSize).toBeGreaterThan(shortSize);
  });
});
