// Textile Engineering — yarn linear density (count) system conversion and
// basic fabric areal density (GSM). Yarn count systems are standardized
// unit definitions (not empirical data), so the conversion constants are
// derived here directly from their definitions rather than sourced
// externally — self-verifiable by unit arithmetic:
//
//   Tex    = mass(g) per 1000 m of yarn                    (direct system)
//   Denier = mass(g) per 9000 m of yarn = 9 * Tex           (direct system)
//   Nm     = number of 1000m (1km) lengths per kg = 1000/Tex (indirect)
//   Ne     = number of 840-yard hanks per pound (indirect, English cotton count)
//
//   Ne -> Tex derivation: 1 hank = 840 yd = 840*0.9144 m = 768.096 m
//                          1 lb = 453.592 g
//     Tex = 1000 * (453.592 g) / (Ne * 768.096 m) = 590.54 / Ne
//     (this reproduces the commonly cited "590.5/Ne" constant)
//
// Since Tex is the common pivot unit, all conversions route through it.
//
// Fabric areal density: GSM (g/m^2) = mass(g) / area(m^2); linear weight
// (g/m) = GSM * fabric width (m). Simple, definitional — not the more
// complex construction-based GSM estimate from thread count and weave
// crimp factors, which varies by weave structure and was not implemented
// here to avoid an unverified/oversimplified formula.

const HANK_YARDS = 840;
const YARD_TO_M = 0.9144;
const LB_TO_G = 453.592;
const HANK_LENGTH_M = HANK_YARDS * YARD_TO_M; // 768.096 m
export const NE_TO_TEX_CONSTANT = (1000 * LB_TO_G) / HANK_LENGTH_M; // ~590.54

export type YarnCountSystem = "tex" | "denier" | "ne" | "nm";

export function convertToTex(value: number, system: YarnCountSystem): number {
  switch (system) {
    case "tex":
      return value;
    case "denier":
      return value / 9;
    case "nm":
      return 1000 / value;
    case "ne":
      return NE_TO_TEX_CONSTANT / value;
  }
}

export function convertFromTex(tex: number, system: YarnCountSystem): number {
  switch (system) {
    case "tex":
      return tex;
    case "denier":
      return tex * 9;
    case "nm":
      return 1000 / tex;
    case "ne":
      return NE_TO_TEX_CONSTANT / tex;
  }
}

export interface YarnCountAllSystems {
  tex: number;
  denier: number;
  ne: number;
  nm: number;
}

export function convertYarnCount(
  value: number,
  fromSystem: YarnCountSystem,
): YarnCountAllSystems {
  const tex = convertToTex(value, fromSystem);
  return {
    tex,
    denier: convertFromTex(tex, "denier"),
    ne: convertFromTex(tex, "ne"),
    nm: convertFromTex(tex, "nm"),
  };
}

export interface FabricAreaDensityInput {
  sampleMassG: number;
  sampleAreaM2: number;
  fabricWidthM: number;
}

export interface FabricAreaDensityResult {
  gsm: number;
  linearWeightGM: number;
  linearWeightKgM: number;
}

export function calculateFabricAreaDensity(
  input: FabricAreaDensityInput,
): FabricAreaDensityResult {
  const gsm = input.sampleMassG / input.sampleAreaM2;
  const linearWeightGM = gsm * input.fabricWidthM;
  return { gsm, linearWeightGM, linearWeightKgM: linearWeightGM / 1000 };
}
