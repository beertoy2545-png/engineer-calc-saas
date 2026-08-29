// Steam mass-flow and pipe-sizing calculator.
// Source: ME444 Engineering Piping System Design course material
// (Thammasat University), Chapters 11-12 - Steam System, and the course's
// saturated-steam property table (calculation-tables reference).
//
// m_dot = Q_load / h_fg          (steam mass flow needed for a heat load)
// V_dot = m_dot * v_g            (volumetric flow at that pressure)
// v     = V_dot / A              (velocity in a given standard pipe size)
//
// Recommended steam velocity: 15-35 m/s (low pressure steam distribution).
//
// This is a design-aid tool only — final sizing should account for pressure
// drop over the actual run length and be reviewed by a licensed mechanical
// engineer before installation.

import { PIPE_SIZE_TABLES, type PipeMaterial } from "./pipeSizing";

export interface SteamTableRow {
  pressureBarg: number;
  tSatC: number;
  hfKjKg: number;
  hfgKjKg: number;
  hgKjKg: number;
  vgM3Kg: number;
}

// Saturated steam table (as tabulated in the course material).
export const STEAM_TABLE: SteamTableRow[] = [
  { pressureBarg: 0, tSatC: 100.0, hfKjKg: 419.1, hfgKjKg: 2257.0, hgKjKg: 2676.1, vgM3Kg: 1.673 },
  { pressureBarg: 1, tSatC: 120.2, hfKjKg: 504.7, hfgKjKg: 2201.6, hgKjKg: 2706.3, vgM3Kg: 0.886 },
  { pressureBarg: 2, tSatC: 133.5, hfKjKg: 561.1, hfgKjKg: 2163.5, hgKjKg: 2724.5, vgM3Kg: 0.606 },
  { pressureBarg: 3, tSatC: 143.6, hfKjKg: 604.7, hfgKjKg: 2133.4, hgKjKg: 2738.1, vgM3Kg: 0.463 },
  { pressureBarg: 4, tSatC: 151.8, hfKjKg: 640.1, hfgKjKg: 2107.4, hgKjKg: 2747.5, vgM3Kg: 0.375 },
  { pressureBarg: 5, tSatC: 158.8, hfKjKg: 670.4, hfgKjKg: 2085.0, hgKjKg: 2755.5, vgM3Kg: 0.315 },
  { pressureBarg: 7, tSatC: 170.4, hfKjKg: 721.0, hfgKjKg: 2046.5, hgKjKg: 2767.5, vgM3Kg: 0.24 },
  { pressureBarg: 8, tSatC: 175.4, hfKjKg: 742.6, hfgKjKg: 2031.7, hgKjKg: 2774.3, vgM3Kg: 0.215 },
  { pressureBarg: 10, tSatC: 184.1, hfKjKg: 780.1, hfgKjKg: 2000.4, hgKjKg: 2780.4, vgM3Kg: 0.177 },
  { pressureBarg: 15, tSatC: 201.4, hfKjKg: 844.6, hfgKjKg: 1946.4, hgKjKg: 2791.0, vgM3Kg: 0.123 },
  { pressureBarg: 20, tSatC: 215.3, hfKjKg: 897.8, hfgKjKg: 1890.7, hgKjKg: 2788.5, vgM3Kg: 0.0948 },
];

function interpolate(x: number, xs: number[], ys: number[]): number {
  const clamped = Math.min(Math.max(x, xs[0]), xs[xs.length - 1]);
  for (let i = 0; i < xs.length - 1; i++) {
    if (clamped >= xs[i] && clamped <= xs[i + 1]) {
      const t = (clamped - xs[i]) / (xs[i + 1] - xs[i]);
      return ys[i] + t * (ys[i + 1] - ys[i]);
    }
  }
  return ys[ys.length - 1];
}

export function steamPropertiesAt(pressureBarg: number): SteamTableRow {
  const pressures = STEAM_TABLE.map((r) => r.pressureBarg);
  return {
    pressureBarg,
    tSatC: interpolate(pressureBarg, pressures, STEAM_TABLE.map((r) => r.tSatC)),
    hfKjKg: interpolate(pressureBarg, pressures, STEAM_TABLE.map((r) => r.hfKjKg)),
    hfgKjKg: interpolate(pressureBarg, pressures, STEAM_TABLE.map((r) => r.hfgKjKg)),
    hgKjKg: interpolate(pressureBarg, pressures, STEAM_TABLE.map((r) => r.hgKjKg)),
    vgM3Kg: interpolate(pressureBarg, pressures, STEAM_TABLE.map((r) => r.vgM3Kg)),
  };
}

export const STEAM_VELOCITY_RANGE_MS = { min: 15, max: 35 };

export interface SteamSizingInput {
  pressureBarg: number;
  heatLoadKw: number;
  material: PipeMaterial;
  velocityMinMs: number;
  velocityMaxMs: number;
}

export interface SteamSizeResult {
  size: { label: string; dnMm: number; idMm: number };
  velocityMs: number;
  velocityInRange: boolean;
}

export interface SteamSizingOutput {
  steamProps: SteamTableRow;
  massFlowKgH: number;
  volumeFlowM3S: number;
  results: SteamSizeResult[];
  recommendedIndex: number;
}

export function calculateSteamSizing(input: SteamSizingInput): SteamSizingOutput {
  const steamProps = steamPropertiesAt(input.pressureBarg);

  const massFlowKgS = input.heatLoadKw / steamProps.hfgKjKg; // kW / (kJ/kg) = kg/s
  const massFlowKgH = massFlowKgS * 3600;
  const volumeFlowM3S = massFlowKgS * steamProps.vgM3Kg;

  const sizes = PIPE_SIZE_TABLES[input.material];
  const results: SteamSizeResult[] = sizes.map((size) => {
    const dM = size.idMm / 1000;
    const areaM2 = (Math.PI * dM * dM) / 4;
    const velocityMs = volumeFlowM3S / areaM2;
    const velocityInRange =
      velocityMs >= input.velocityMinMs && velocityMs <= input.velocityMaxMs;
    return { size, velocityMs, velocityInRange };
  });

  let recommendedIndex = results.findIndex((r) => r.velocityInRange);
  if (recommendedIndex === -1) {
    recommendedIndex = results.findIndex((r) => r.velocityMs <= input.velocityMaxMs);
  }
  if (recommendedIndex === -1) recommendedIndex = results.length - 1;

  return { steamProps, massFlowKgH, volumeFlowM3S, results, recommendedIndex };
}
