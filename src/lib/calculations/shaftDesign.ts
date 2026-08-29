// Shaft diameter sizing using the ASME Code method.
// Source: ME310 Mechanical Design course material (Thammasat University),
// Module 3.2 - Shafts, "Application of ASME Code for Shaft Design" (eq. 3.4),
// and Table 1.7 material properties (cited in the course from Shigley, 2003).
//
// tau_max = min(0.3*Sy, 0.18*Sut), reduced 25% if a keyway is present, and
//           capped at 55 MPa (no keyway) / 41 MPa (with keyway) for steel.
// d = [ 16 / (pi * tau_max) * sqrt((kb*M)^2 + (kt*T)^2) ] ^ (1/3)
//
// Design-aid tool only — final shaft sizing (stress concentration, fatigue
// via Soderberg, deflection, vibration) should be reviewed by a licensed
// mechanical engineer before manufacture.

export interface MaterialPreset {
  key: string;
  label: string;
  syMpa: number;
  sutMpa: number;
}

// Table 1.7 (Shigley, 2003) as cited in the course material.
export const MATERIAL_PRESETS: MaterialPreset[] = [
  { key: "aisi1020", label: "Low carbon steel AISI 1020", syMpa: 295, sutMpa: 395 },
  { key: "aisi1040", label: "Medium carbon steel AISI 1040", syMpa: 350, sutMpa: 520 },
  { key: "aisi1080", label: "High carbon steel AISI 1080", syMpa: 380, sutMpa: 615 },
  { key: "aisi4130", label: "Alloy steel Cr-Mo AISI 4130", syMpa: 435, sutMpa: 670 },
  { key: "ss304", label: "Stainless steel SS304", syMpa: 215, sutMpa: 505 },
  { key: "ss316", label: "Stainless steel SS316", syMpa: 207, sutMpa: 552 },
  { key: "custom", label: "กำหนดเอง (Custom)", syMpa: 250, sutMpa: 400 },
];

export const STANDARD_SHAFT_MM = [
  6, 8, 10, 12, 14, 15, 16, 18, 20, 22, 25, 28, 30, 32, 35, 38, 40, 42, 45, 48,
  50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 110, 120, 130, 140, 150,
];

export interface ShaftDesignInput {
  powerKw: number;
  speedRpm: number;
  bendingMomentNm: number;
  syMpa: number;
  sutMpa: number;
  hasKeyway: boolean;
  kb: number;
  kt: number;
}

export interface ShaftDesignResult {
  torqueNm: number;
  tauAllowMpaRaw: number; // min(0.3Sy, 0.18Sut) before keyway/cap adjustment
  tauAllowMpa: number; // after keyway reduction and steel cap
  keywayReduced: boolean;
  cappedByCode: boolean;
  requiredDiameterMm: number;
  recommendedDiameterMm: number;
}

export function calculateShaftDesign(input: ShaftDesignInput): ShaftDesignResult {
  const torqueNm = (9549.3 * input.powerKw) / input.speedRpm;

  const tauAllowMpaRaw = Math.min(0.3 * input.syMpa, 0.18 * input.sutMpa);
  let tauAllowMpa = input.hasKeyway ? tauAllowMpaRaw * 0.75 : tauAllowMpaRaw;

  const codeCapMpa = input.hasKeyway ? 41 : 55;
  const cappedByCode = tauAllowMpa > codeCapMpa;
  if (cappedByCode) tauAllowMpa = codeCapMpa;

  const tauAllowPa = tauAllowMpa * 1e6;
  const kbM = input.kb * input.bendingMomentNm;
  const ktT = input.kt * torqueNm;

  const dCubedM3 =
    (16 / (Math.PI * tauAllowPa)) * Math.sqrt(kbM ** 2 + ktT ** 2);
  const requiredDiameterM = Math.cbrt(dCubedM3);
  const requiredDiameterMm = requiredDiameterM * 1000;

  const recommendedDiameterMm =
    STANDARD_SHAFT_MM.find((d) => d >= requiredDiameterMm) ??
    STANDARD_SHAFT_MM[STANDARD_SHAFT_MM.length - 1];

  return {
    torqueNm,
    tauAllowMpaRaw,
    tauAllowMpa,
    keywayReduced: input.hasKeyway,
    cappedByCode,
    requiredDiameterMm,
    recommendedDiameterMm,
  };
}
