import { describe, expect, it } from "vitest";
import { calculateSteamSizing, steamPropertiesAt } from "./steamSizing";

describe("steamPropertiesAt", () => {
  it("returns exact table values at a tabulated pressure", () => {
    const props = steamPropertiesAt(5);
    expect(props.tSatC).toBeCloseTo(158.8, 1);
    expect(props.hfgKjKg).toBeCloseTo(2085.0, 1);
    expect(props.vgM3Kg).toBeCloseTo(0.315, 3);
  });

  it("interpolates between tabulated pressures", () => {
    const props = steamPropertiesAt(6); // between 5 and 7 barg rows
    expect(props.tSatC).toBeGreaterThan(158.8);
    expect(props.tSatC).toBeLessThan(170.4);
  });
});

describe("calculateSteamSizing", () => {
  it("matches a hand-calculated reference case (5 barg, 500 kW)", () => {
    const output = calculateSteamSizing({
      pressureBarg: 5,
      heatLoadKw: 500,
      material: "steel",
      velocityMinMs: 15,
      velocityMaxMs: 35,
    });

    // m_dot = 500 kW / 2085.0 kJ/kg = 0.2398 kg/s = 863.3 kg/hr
    expect(output.massFlowKgH).toBeCloseTo(863.3, 0);

    const recommended = output.results[output.recommendedIndex];
    expect(recommended.size.label).toBe('2" (DN50)');
    expect(recommended.velocityMs).toBeCloseTo(34.9, 1);
    expect(recommended.velocityInRange).toBe(true);
  });

  it("requires a larger pipe for a higher heat load", () => {
    const low = calculateSteamSizing({
      pressureBarg: 5,
      heatLoadKw: 100,
      material: "steel",
      velocityMinMs: 15,
      velocityMaxMs: 35,
    });
    const high = calculateSteamSizing({
      pressureBarg: 5,
      heatLoadKw: 2000,
      material: "steel",
      velocityMinMs: 15,
      velocityMaxMs: 35,
    });
    expect(high.results[high.recommendedIndex].size.dnMm).toBeGreaterThan(
      low.results[low.recommendedIndex].size.dnMm,
    );
  });
});
