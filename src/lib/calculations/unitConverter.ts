// General-purpose engineering unit converter.
// Linear-scale categories (length, area, volume, mass, force, pressure,
// energy, power, flow rate, velocity) convert via a factor to a fixed SI
// base unit: value_SI = value * factorToSi; result = value_SI / factorToSi(target).
// Temperature is handled separately since C/F/K are not linearly related
// through the origin (affine, not linear, conversion).
//
// All conversion factors below are standard, internationally-defined
// constants (e.g. 1 in = 25.4 mm exactly, 1 lbf = 4.4482216152605 N
// exactly) — no external source needed, these do not vary by textbook.

export type UnitCategory =
  | "length"
  | "area"
  | "volume"
  | "mass"
  | "force"
  | "pressure"
  | "energy"
  | "power"
  | "flowRate"
  | "velocity"
  | "temperature";

export interface UnitDef {
  key: string;
  label: string;
  toSi: number; // multiply value by this to get the SI base unit
}

// SI base units per category: length=m, area=m2, volume=m3, mass=kg,
// force=N, pressure=Pa, energy=J, power=W, flowRate=m3/s, velocity=m/s
export const UNIT_CATEGORIES: Record<UnitCategory, { label: string; units: UnitDef[] }> = {
  length: {
    label: "ความยาว (Length)",
    units: [
      { key: "mm", label: "มิลลิเมตร (mm)", toSi: 0.001 },
      { key: "cm", label: "เซนติเมตร (cm)", toSi: 0.01 },
      { key: "m", label: "เมตร (m)", toSi: 1 },
      { key: "km", label: "กิโลเมตร (km)", toSi: 1000 },
      { key: "in", label: "นิ้ว (in)", toSi: 0.0254 },
      { key: "ft", label: "ฟุต (ft)", toSi: 0.3048 },
      { key: "yd", label: "หลา (yd)", toSi: 0.9144 },
      { key: "mi", label: "ไมล์ (mi)", toSi: 1609.344 },
    ],
  },
  area: {
    label: "พื้นที่ (Area)",
    units: [
      { key: "mm2", label: "mm²", toSi: 1e-6 },
      { key: "cm2", label: "cm²", toSi: 1e-4 },
      { key: "m2", label: "m²", toSi: 1 },
      { key: "km2", label: "km²", toSi: 1e6 },
      { key: "in2", label: "in²", toSi: 0.00064516 },
      { key: "ft2", label: "ft²", toSi: 0.09290304 },
      { key: "acre", label: "acre", toSi: 4046.8564224 },
      { key: "rai", label: "ไร่", toSi: 1600 },
    ],
  },
  volume: {
    label: "ปริมาตร (Volume)",
    units: [
      { key: "ml", label: "มิลลิลิตร (mL)", toSi: 1e-6 },
      { key: "l", label: "ลิตร (L)", toSi: 1e-3 },
      { key: "m3", label: "m³", toSi: 1 },
      { key: "ft3", label: "ft³", toSi: 0.028316846592 },
      { key: "gal_us", label: "แกลลอน (US gal)", toSi: 0.003785411784 },
      { key: "gal_uk", label: "แกลลอน (UK gal)", toSi: 0.00454609 },
      { key: "barrel_oil", label: "บาร์เรลน้ำมัน (bbl)", toSi: 0.158987294928 },
    ],
  },
  mass: {
    label: "มวล (Mass)",
    units: [
      { key: "g", label: "กรัม (g)", toSi: 0.001 },
      { key: "kg", label: "กิโลกรัม (kg)", toSi: 1 },
      { key: "ton_metric", label: "ตัน (metric ton)", toSi: 1000 },
      { key: "lb", label: "ปอนด์ (lb)", toSi: 0.45359237 },
      { key: "oz", label: "ออนซ์ (oz)", toSi: 0.028349523125 },
      { key: "ton_us", label: "US ton (short)", toSi: 907.18474 },
    ],
  },
  force: {
    label: "แรง (Force)",
    units: [
      { key: "n", label: "นิวตัน (N)", toSi: 1 },
      { key: "kn", label: "กิโลนิวตัน (kN)", toSi: 1000 },
      { key: "kgf", label: "kgf", toSi: 9.80665 },
      { key: "lbf", label: "ปอนด์แรง (lbf)", toSi: 4.4482216152605 },
      { key: "dyne", label: "ไดน์ (dyn)", toSi: 1e-5 },
    ],
  },
  pressure: {
    label: "ความดัน (Pressure)",
    units: [
      { key: "pa", label: "ปาสคาล (Pa)", toSi: 1 },
      { key: "kpa", label: "กิโลปาสคาล (kPa)", toSi: 1000 },
      { key: "mpa", label: "เมกะปาสคาล (MPa)", toSi: 1e6 },
      { key: "bar", label: "บาร์ (bar)", toSi: 1e5 },
      { key: "atm", label: "บรรยากาศ (atm)", toSi: 101325 },
      { key: "psi", label: "psi", toSi: 6894.757293168 },
      { key: "mmhg", label: "mmHg", toSi: 133.322387415 },
      { key: "mwa", label: "เมตรน้ำ (m.WA.)", toSi: 9806.65 },
    ],
  },
  energy: {
    label: "พลังงาน (Energy)",
    units: [
      { key: "j", label: "จูล (J)", toSi: 1 },
      { key: "kj", label: "กิโลจูล (kJ)", toSi: 1000 },
      { key: "mj", label: "เมกะจูล (MJ)", toSi: 1e6 },
      { key: "cal", label: "แคลอรี (cal)", toSi: 4.184 },
      { key: "kcal", label: "กิโลแคลอรี (kcal)", toSi: 4184 },
      { key: "wh", label: "วัตต์-ชั่วโมง (Wh)", toSi: 3600 },
      { key: "kwh", label: "กิโลวัตต์-ชั่วโมง (kWh)", toSi: 3.6e6 },
      { key: "btu", label: "BTU", toSi: 1055.05585262 },
    ],
  },
  power: {
    label: "กำลัง (Power)",
    units: [
      { key: "w", label: "วัตต์ (W)", toSi: 1 },
      { key: "kw", label: "กิโลวัตต์ (kW)", toSi: 1000 },
      { key: "mw", label: "เมกะวัตต์ (MW)", toSi: 1e6 },
      { key: "hp", label: "แรงม้า (hp, mechanical)", toSi: 745.6998715823 },
      { key: "btu_hr", label: "BTU/hr", toSi: 0.29307107017 },
      { key: "ton_refrig", label: "ตันความเย็น (Ton of Refrigeration)", toSi: 3516.853 },
    ],
  },
  flowRate: {
    label: "อัตราการไหล (Flow Rate)",
    units: [
      { key: "m3s", label: "m³/s", toSi: 1 },
      { key: "m3hr", label: "m³/hr", toSi: 1 / 3600 },
      { key: "lpm", label: "L/min (lpm)", toSi: 1e-3 / 60 },
      { key: "lps", label: "L/s", toSi: 1e-3 },
      { key: "gpm_us", label: "US gpm", toSi: 0.003785411784 / 60 },
      { key: "cfm", label: "CFM (ft³/min)", toSi: 0.028316846592 / 60 },
    ],
  },
  velocity: {
    label: "ความเร็ว (Velocity)",
    units: [
      { key: "ms", label: "m/s", toSi: 1 },
      { key: "kmh", label: "km/hr", toSi: 1 / 3.6 },
      { key: "fts", label: "ft/s", toSi: 0.3048 },
      { key: "mph", label: "mph", toSi: 0.44704 },
      { key: "knot", label: "knot", toSi: 0.514444444 },
    ],
  },
  temperature: {
    label: "อุณหภูมิ (Temperature)",
    units: [
      { key: "c", label: "เซลเซียส (°C)", toSi: 1 },
      { key: "f", label: "ฟาเรนไฮต์ (°F)", toSi: 1 },
      { key: "k", label: "เคลวิน (K)", toSi: 1 },
    ],
  },
};

export function convertUnit(
  category: UnitCategory,
  value: number,
  fromKey: string,
  toKey: string,
): number {
  if (category === "temperature") {
    // Convert to Celsius first, then to target.
    let celsius: number;
    if (fromKey === "c") celsius = value;
    else if (fromKey === "f") celsius = ((value - 32) * 5) / 9;
    else celsius = value - 273.15; // K

    if (toKey === "c") return celsius;
    if (toKey === "f") return (celsius * 9) / 5 + 32;
    return celsius + 273.15; // K
  }

  const units = UNIT_CATEGORIES[category].units;
  const from = units.find((u) => u.key === fromKey);
  const to = units.find((u) => u.key === toKey);
  if (!from || !to) return NaN;

  const valueSi = value * from.toSi;
  return valueSi / to.toSi;
}
