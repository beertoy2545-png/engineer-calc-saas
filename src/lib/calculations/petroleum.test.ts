import { describe, expect, it } from "vitest";
import {
  calculateGasInPlace,
  calculateOilInPlace,
  calculateWellInflow,
} from "./petroleum";

describe("calculateOilInPlace", () => {
  // Hand-calculated: A=640 acres, h=50ft, phi=0.22, Sw=0.25, Boi=1.35
  it("matches a hand-calculated case", () => {
    const n = calculateOilInPlace({
      areaAcres: 640,
      netPayFt: 50,
      porosityFrac: 0.22,
      waterSaturationFrac: 0.25,
      formationVolumeFactor: 1.35,
    });
    expect(n).toBeCloseTo(30342400, -2);
  });
});

describe("calculateGasInPlace", () => {
  // Hand-calculated: A=640 acres, h=50ft, phi=0.22, Sw=0.25, Bgi=0.0055
  it("matches a hand-calculated case", () => {
    const g = calculateGasInPlace({
      areaAcres: 640,
      netPayFt: 50,
      porosityFrac: 0.22,
      waterSaturationFrac: 0.25,
      formationVolumeFactor: 0.0055,
    });
    expect(g).toBeCloseTo(41817600000, -4);
  });
});

describe("calculateWellInflow", () => {
  // Hand-calculated: k=50md, h=30ft, Pe=3000psi, Pwf=2000psi, mu=1.5cp,
  // Bo=1.2, re=1000ft, rw=0.328ft, s=0 -> q ~ 811.5 STB/day
  it("matches a hand-calculated case", () => {
    const result = calculateWellInflow({
      permeabilityMd: 50,
      netPayFt: 30,
      reservoirPressurePsi: 3000,
      flowingBhpPsi: 2000,
      oilViscosityCp: 1.5,
      oilFvfRbStb: 1.2,
      drainageRadiusFt: 1000,
      wellboreRadiusFt: 0.328,
      skinFactor: 0,
    });
    expect(result.flowRateStbDay).toBeCloseTo(811.5, 0);
  });

  it("reduces flow rate for a positive (damaged) skin factor", () => {
    const clean = calculateWellInflow({
      permeabilityMd: 50,
      netPayFt: 30,
      reservoirPressurePsi: 3000,
      flowingBhpPsi: 2000,
      oilViscosityCp: 1.5,
      oilFvfRbStb: 1.2,
      drainageRadiusFt: 1000,
      wellboreRadiusFt: 0.328,
      skinFactor: 0,
    });
    const damaged = calculateWellInflow({
      permeabilityMd: 50,
      netPayFt: 30,
      reservoirPressurePsi: 3000,
      flowingBhpPsi: 2000,
      oilViscosityCp: 1.5,
      oilFvfRbStb: 1.2,
      drainageRadiusFt: 1000,
      wellboreRadiusFt: 0.328,
      skinFactor: 10, // significant near-wellbore damage
    });
    expect(damaged.flowRateStbDay).toBeLessThan(clean.flowRateStbDay);
  });

  it("increases flow rate for higher permeability", () => {
    const low = calculateWellInflow({
      permeabilityMd: 10,
      netPayFt: 30,
      reservoirPressurePsi: 3000,
      flowingBhpPsi: 2000,
      oilViscosityCp: 1.5,
      oilFvfRbStb: 1.2,
      drainageRadiusFt: 1000,
      wellboreRadiusFt: 0.328,
      skinFactor: 0,
    });
    const high = calculateWellInflow({
      permeabilityMd: 100,
      netPayFt: 30,
      reservoirPressurePsi: 3000,
      flowingBhpPsi: 2000,
      oilViscosityCp: 1.5,
      oilFvfRbStb: 1.2,
      drainageRadiusFt: 1000,
      wellboreRadiusFt: 0.328,
      skinFactor: 0,
    });
    expect(high.flowRateStbDay).toBeGreaterThan(low.flowRateStbDay);
  });
});
