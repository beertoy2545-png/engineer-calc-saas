export interface ToolInfo {
  href: string;
  title: string;
  description: string;
  category: string;
  standard: string;
}

export const TOOLS: ToolInfo[] = [
  {
    href: "/cooling-load",
    title: "Cooling Load",
    description: "ประมาณภาระความเย็นของห้องและขนาดเครื่องปรับอากาศที่เหมาะสม",
    category: "HVAC",
    standard: "Rule-of-thumb estimation",
  },
  {
    href: "/pipe-sizing",
    title: "Pipe Sizing",
    description:
      "คำนวณขนาดท่อน้ำจากอัตราการไหล พร้อมเปรียบเทียบ Head Loss ทุกขนาดมาตรฐาน",
    category: "Piping",
    standard: "ME444 — Darcy-Weisbach / Swamee-Jain",
  },
  {
    href: "/pump",
    title: "Pump Head, Power & NPSH",
    description: "คำนวณ Head, กำลังมอเตอร์ที่ต้องใช้ และตรวจสอบความเสี่ยง Cavitation",
    category: "Piping",
    standard: "ME444 Chapter 6",
  },
  {
    href: "/steam",
    title: "Steam Flow & Pipe Sizing",
    description: "คำนวณอัตราการไหลของไอน้ำจากภาระความร้อน และเลือกขนาดท่อไอน้ำ",
    category: "Piping",
    standard: "ME444 Chapter 11-12",
  },
  {
    href: "/shaft-design",
    title: "Shaft Design",
    description: "คำนวณขนาดเพลาส่งกำลังตามวิธี ASME Code จากแรงบิดและโมเมนต์ดัด",
    category: "Machine Design",
    standard: "ME310 — ASME Code Method",
  },
  {
    href: "/cable-sizing",
    title: "Cable Sizing & Voltage Drop",
    description:
      "คำนวณขนาดสายไฟฟ้าจากโหลด พร้อมตรวจสอบ Voltage Drop และ correction factor",
    category: "Electrical",
    standard: "IEC 60364-5-52",
  },
  {
    href: "/beam-analysis",
    title: "Beam Bending & Deflection",
    description:
      "คำนวณโมเมนต์ดัด ความเค้น และ Deflection ของคานช่วงเดียว/คานยื่น ภายใต้โหลดจุดหรือโหลดแผ่",
    category: "Structural",
    standard: "Euler-Bernoulli Beam Theory",
  },
  {
    href: "/heat-exchanger",
    title: "Heat Exchanger Sizing (LMTD)",
    description:
      "คำนวณพื้นที่แลกเปลี่ยนความร้อนที่ต้องการ เปรียบเทียบ Counterflow กับ Parallel Flow",
    category: "Chemical / Process",
    standard: "LMTD Method",
  },
  {
    href: "/truss-analysis",
    title: "2D Truss Analysis",
    description:
      "วิเคราะห์โครงถัก 2 มิติด้วยวิธี Direct Stiffness Method — กำหนดจุดต่อ ชิ้นส่วน และโหลดเอง",
    category: "Structural",
    standard: "Matrix Stiffness Method",
  },
  {
    href: "/unit-converter",
    title: "Unit Converter",
    description:
      "แปลงหน่วยวิศวกรรมที่ใช้บ่อย ความยาว พื้นที่ ปริมาตร มวล แรง ความดัน พลังงาน กำลัง และอื่นๆ",
    category: "Utilities",
    standard: "SI / Imperial standard constants",
  },
];
