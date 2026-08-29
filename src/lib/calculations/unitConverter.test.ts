import { describe, expect, it } from "vitest";
import { convertUnit } from "./unitConverter";

describe("convertUnit", () => {
  it("converts length exactly (1 inch = 25.4 mm)", () => {
    expect(convertUnit("length", 1, "in", "mm")).toBeCloseTo(25.4, 6);
  });

  it("converts mass (1 kg to lb)", () => {
    expect(convertUnit("mass", 1, "kg", "lb")).toBeCloseTo(2.2046226, 5);
  });

  it("converts pressure (1 atm to psi and Pa)", () => {
    expect(convertUnit("pressure", 1, "atm", "pa")).toBeCloseTo(101325, 0);
    expect(convertUnit("pressure", 1, "atm", "psi")).toBeCloseTo(14.6959, 3);
  });

  it("converts power (1 kW to hp)", () => {
    expect(convertUnit("power", 1, "kw", "hp")).toBeCloseTo(1.341022, 4);
  });

  it("converts flow rate (1 US gpm to L/min)", () => {
    expect(convertUnit("flowRate", 1, "gpm_us", "lpm")).toBeCloseTo(3.785412, 4);
  });

  it("round-trips through the SI base unit without drift", () => {
    const value = 123.456;
    const converted = convertUnit("length", value, "ft", "km");
    const back = convertUnit("length", converted, "km", "ft");
    expect(back).toBeCloseTo(value, 6);
  });

  it("handles temperature affine conversions correctly", () => {
    expect(convertUnit("temperature", 100, "c", "f")).toBeCloseTo(212, 6);
    expect(convertUnit("temperature", 100, "c", "k")).toBeCloseTo(373.15, 6);
    expect(convertUnit("temperature", 32, "f", "c")).toBeCloseTo(0, 6);
    expect(convertUnit("temperature", 0, "k", "c")).toBeCloseTo(-273.15, 6);
  });
});
