// Beam bending stress and deflection calculator — simply supported and
// cantilever beams under a center/end point load or a uniformly
// distributed load (UDL). Classic Euler-Bernoulli beam theory, cross-
// checked against standard structural references (e.g. AISC/Roark's
// beam formula tables) via web search:
//
//   Simply supported, center point load P: Mmax = PL/4     dmax = PL^3/(48EI)
//   Simply supported, UDL w:               Mmax = wL^2/8   dmax = 5wL^4/(384EI)
//   Cantilever, end point load P:          Mmax = PL       dmax = PL^3/(3EI)
//   Cantilever, UDL w:                     Mmax = wL^2/2   dmax = wL^4/(8EI)
//
// Bending stress: sigma = M*c / I
//
// Units used internally: length in mm, force in N, so 1 kN/m of UDL is
// numerically 1 N/mm — no extra conversion factor needed. E is entered in
// GPa and converted to MPa (N/mm^2).
//
// This covers only the four textbook-standard support/load cases above —
// it does not handle off-center loads, multi-span, or combined loading.
// Design-aid tool only — final structural sizing must be reviewed and
// stamped by a licensed structural/civil engineer.

export type SupportType = "simplySupported" | "cantilever";
export type LoadType = "point" | "udl";
export type CrossSectionType = "rectangular" | "circular" | "custom";

export interface CrossSectionInput {
  type: CrossSectionType;
  widthMm?: number; // rectangular
  heightMm?: number; // rectangular
  diameterMm?: number; // circular
  customIMm4?: number; // custom
  customCMm?: number; // custom
}

export interface BeamAnalysisInput {
  supportType: SupportType;
  loadType: LoadType;
  pointLoadKn: number; // used when loadType === "point"
  udlKnPerM: number; // used when loadType === "udl" (numerically N/mm)
  spanM: number;
  elasticModulusGpa: number;
  crossSection: CrossSectionInput;
  yieldStrengthMpa: number;
  safetyFactor: number;
  deflectionLimitDenominator: number; // e.g. 360 for L/360
}

export interface BeamAnalysisResult {
  iMm4: number;
  cMm: number;
  maxMomentNmm: number;
  maxBendingStressMpa: number;
  allowableStressMpa: number;
  stressOk: boolean;
  maxDeflectionMm: number;
  deflectionLimitMm: number;
  deflectionOk: boolean;
}

function sectionProperties(cs: CrossSectionInput): { iMm4: number; cMm: number } {
  if (cs.type === "rectangular") {
    const b = cs.widthMm ?? 0;
    const h = cs.heightMm ?? 0;
    return { iMm4: (b * h ** 3) / 12, cMm: h / 2 };
  }
  if (cs.type === "circular") {
    const d = cs.diameterMm ?? 0;
    return { iMm4: (Math.PI * d ** 4) / 64, cMm: d / 2 };
  }
  return { iMm4: cs.customIMm4 ?? 0, cMm: cs.customCMm ?? 0 };
}

export function calculateBeamAnalysis(input: BeamAnalysisInput): BeamAnalysisResult {
  const { iMm4, cMm } = sectionProperties(input.crossSection);
  const eMpa = input.elasticModulusGpa * 1000;
  const lMm = input.spanM * 1000;

  const pN = input.pointLoadKn * 1000;
  const wNPerMm = input.udlKnPerM; // kN/m numerically equals N/mm

  let maxMomentNmm: number;
  let maxDeflectionMm: number;

  if (input.supportType === "simplySupported") {
    if (input.loadType === "point") {
      maxMomentNmm = (pN * lMm) / 4;
      maxDeflectionMm = (pN * lMm ** 3) / (48 * eMpa * iMm4);
    } else {
      maxMomentNmm = (wNPerMm * lMm ** 2) / 8;
      maxDeflectionMm = (5 * wNPerMm * lMm ** 4) / (384 * eMpa * iMm4);
    }
  } else {
    if (input.loadType === "point") {
      maxMomentNmm = pN * lMm;
      maxDeflectionMm = (pN * lMm ** 3) / (3 * eMpa * iMm4);
    } else {
      maxMomentNmm = (wNPerMm * lMm ** 2) / 2;
      maxDeflectionMm = (wNPerMm * lMm ** 4) / (8 * eMpa * iMm4);
    }
  }

  const maxBendingStressMpa = (maxMomentNmm * cMm) / iMm4;
  const allowableStressMpa = input.yieldStrengthMpa / input.safetyFactor;
  const deflectionLimitMm = lMm / input.deflectionLimitDenominator;

  return {
    iMm4,
    cMm,
    maxMomentNmm,
    maxBendingStressMpa,
    allowableStressMpa,
    stressOk: maxBendingStressMpa <= allowableStressMpa,
    maxDeflectionMm,
    deflectionLimitMm,
    deflectionOk: maxDeflectionMm <= deflectionLimitMm,
  };
}
