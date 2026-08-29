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
];
