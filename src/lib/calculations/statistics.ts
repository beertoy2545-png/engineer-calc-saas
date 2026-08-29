// Descriptive statistics and simple linear regression — general-purpose
// research/data-analysis support, not tied to any single engineering
// discipline. Standard formulas (sample variance with Bessel's correction
// n-1, least-squares linear regression, coefficient of determination).

export interface DescriptiveStats {
  n: number;
  mean: number;
  median: number;
  sampleVariance: number;
  sampleStdDev: number;
  populationVariance: number;
  populationStdDev: number;
  min: number;
  max: number;
  range: number;
  sum: number;
}

export function calculateDescriptiveStats(data: number[]): DescriptiveStats | null {
  const n = data.length;
  if (n === 0) return null;

  const sum = data.reduce((s, x) => s + x, 0);
  const mean = sum / n;

  const sorted = [...data].sort((a, b) => a - b);
  const mid = Math.floor(n / 2);
  const median = n % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];

  const sumSqDev = data.reduce((s, x) => s + (x - mean) ** 2, 0);
  const sampleVariance = n > 1 ? sumSqDev / (n - 1) : 0;
  const populationVariance = sumSqDev / n;

  return {
    n,
    mean,
    median,
    sampleVariance,
    sampleStdDev: Math.sqrt(sampleVariance),
    populationVariance,
    populationStdDev: Math.sqrt(populationVariance),
    min: sorted[0],
    max: sorted[n - 1],
    range: sorted[n - 1] - sorted[0],
    sum,
  };
}

export interface LinearRegressionResult {
  n: number;
  slope: number;
  intercept: number;
  rSquared: number;
  predict: (x: number) => number;
}

export function calculateLinearRegression(
  xs: number[],
  ys: number[],
): LinearRegressionResult | null {
  const n = xs.length;
  if (n === 0 || n !== ys.length) return null;

  const sx = xs.reduce((s, x) => s + x, 0);
  const sy = ys.reduce((s, y) => s + y, 0);
  const sxx = xs.reduce((s, x) => s + x * x, 0);
  const sxy = xs.reduce((s, x, i) => s + x * ys[i], 0);

  const denom = n * sxx - sx * sx;
  if (Math.abs(denom) < 1e-12) return null; // all x identical -> undefined slope

  const slope = (n * sxy - sx * sy) / denom;
  const intercept = (sy - slope * sx) / n;

  const yMean = sy / n;
  const ssTot = ys.reduce((s, y) => s + (y - yMean) ** 2, 0);
  const ssRes = ys.reduce((s, y, i) => s + (y - (slope * xs[i] + intercept)) ** 2, 0);
  const rSquared = ssTot > 1e-12 ? 1 - ssRes / ssTot : 1;

  return {
    n,
    slope,
    intercept,
    rSquared,
    predict: (x: number) => slope * x + intercept,
  };
}

// Parse a free-text blob of numbers separated by commas, whitespace, or
// newlines into a numeric array, ignoring blanks and non-numeric tokens.
export function parseNumberList(text: string): number[] {
  return text
    .split(/[\s,]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map(Number)
    .filter((n) => Number.isFinite(n));
}
