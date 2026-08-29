import { describe, expect, it } from "vitest";
import {
  calculateDescriptiveStats,
  calculateLinearRegression,
  parseNumberList,
} from "./statistics";

describe("calculateDescriptiveStats", () => {
  it("matches a hand-calculated case", () => {
    // x = [1,2,3,4,5]: mean=3, sample variance=2.5, stddev=1.5811, median=3
    const stats = calculateDescriptiveStats([1, 2, 3, 4, 5])!;
    expect(stats.n).toBe(5);
    expect(stats.mean).toBeCloseTo(3, 6);
    expect(stats.median).toBeCloseTo(3, 6);
    expect(stats.sampleVariance).toBeCloseTo(2.5, 6);
    expect(stats.sampleStdDev).toBeCloseTo(1.5811, 3);
    expect(stats.min).toBe(1);
    expect(stats.max).toBe(5);
    expect(stats.range).toBe(4);
  });

  it("computes the median correctly for an even-length dataset", () => {
    const stats = calculateDescriptiveStats([1, 2, 3, 4])!;
    expect(stats.median).toBeCloseTo(2.5, 6);
  });

  it("returns null for an empty dataset", () => {
    expect(calculateDescriptiveStats([])).toBeNull();
  });
});

describe("calculateLinearRegression", () => {
  it("matches a hand-calculated least-squares case", () => {
    // x=[1,2,3,4,5], y=[2,4,5,4,5] -> slope=0.6, intercept=2.2, R^2=0.6
    const reg = calculateLinearRegression([1, 2, 3, 4, 5], [2, 4, 5, 4, 5])!;
    expect(reg.slope).toBeCloseTo(0.6, 6);
    expect(reg.intercept).toBeCloseTo(2.2, 6);
    expect(reg.rSquared).toBeCloseTo(0.6, 6);
    expect(reg.predict(10)).toBeCloseTo(0.6 * 10 + 2.2, 6);
  });

  it("gives R^2 = 1 for a perfect linear fit", () => {
    const reg = calculateLinearRegression([0, 1, 2, 3], [1, 3, 5, 7])!;
    expect(reg.slope).toBeCloseTo(2, 6);
    expect(reg.intercept).toBeCloseTo(1, 6);
    expect(reg.rSquared).toBeCloseTo(1, 6);
  });

  it("returns null when all x values are identical (undefined slope)", () => {
    expect(calculateLinearRegression([5, 5, 5], [1, 2, 3])).toBeNull();
  });
});

describe("parseNumberList", () => {
  it("parses comma, space, and newline separated numbers", () => {
    expect(parseNumberList("1, 2\n3   4,5")).toEqual([1, 2, 3, 4, 5]);
  });

  it("ignores blank tokens and non-numeric junk", () => {
    expect(parseNumberList("1,,2,  ,abc,3")).toEqual([1, 2, 3]);
  });
});
