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
  {
    href: "/statistics",
    title: "Statistics & Regression",
    description:
      "วิเคราะห์ข้อมูลวิจัย/ทดลอง สถิติเชิงพรรณนา และการถดถอยเชิงเส้น สำหรับงานวิจัยและทดลอง",
    category: "Utilities",
    standard: "Least-Squares Linear Regression",
  },
  {
    href: "/rc-beam-design",
    title: "RC Beam Flexural Design",
    description:
      "ออกแบบกำลังรับโมเมนต์ดัดคานคอนกรีตเสริมเหล็ก ตรวจสอบเหล็กเสริมขั้นต่ำและสถานะหน้าตัด",
    category: "Civil",
    standard: "ACI 318 — Whitney Stress Block",
  },
  {
    href: "/clarifier-design",
    title: "Clarifier / Sedimentation Tank Sizing",
    description:
      "ตรวจสอบขนาดถังตกตะกอนน้ำเสียเทียบกับเกณฑ์ SOR, HRT, Weir Loading Rate มาตรฐาน",
    category: "Environmental",
    standard: "Metcalf & Eddy Design Criteria",
  },
  {
    href: "/control-systems",
    title: "Control Systems: Response & PID Tuning",
    description:
      "วิเคราะห์การตอบสนองระบบอันดับสอง และปรับจูน PID ด้วยวิธี Ziegler-Nichols",
    category: "Control Systems",
    standard: "Ziegler-Nichols Tuning Method",
  },
  {
    href: "/aerospace",
    title: "Rocket Propulsion & Orbital Mechanics",
    description:
      "คำนวณ Δv ด้วยสมการจรวด Tsiolkovsky และความเร็ว/คาบวงโคจรวงกลม",
    category: "Aerospace",
    standard: "Tsiolkovsky Rocket Equation",
  },
  {
    href: "/engineering-economics",
    title: "Engineering Economics",
    description:
      "ประเมินความคุ้มค่าโครงการ NPV, IRR, Payback Period และจุดคุ้มทุน ใช้ได้ทุกสาขา",
    category: "Industrial",
    standard: "Time Value of Money",
  },
  {
    href: "/petroleum",
    title: "Petroleum: Reserves & Well Inflow",
    description:
      "คำนวณปริมาณสำรองน้ำมัน/ก๊าซ (OOIP/OGIP) และอัตราการไหลเข้าหลุมด้วยกฎของ Darcy",
    category: "Petroleum",
    standard: "Volumetric Method / Darcy Radial Flow",
  },
  {
    href: "/biomechanics",
    title: "Biomechanics: Joint Static Equilibrium",
    description:
      "วิเคราะห์แรงกล้ามเนื้อและแรงปฏิกิริยาที่ข้อต่อด้วยหลัก Statics (Torque & Force Balance)",
    category: "Biomedical",
    standard: "Static Equilibrium Analysis",
  },
  {
    href: "/vehicle-dynamics",
    title: "Vehicle Braking & Weight Transfer",
    description:
      "คำนวณระยะเบรกและการถ่ายน้ำหนักระหว่างเบรกกะทันหัน จากมวลรถ ความสูง CG และฐานล้อ",
    category: "Automotive",
    standard: "Rigid-Body Vehicle Dynamics",
  },
  {
    href: "/bearing-capacity",
    title: "Shallow Foundation Bearing Capacity",
    description:
      "คำนวณกำลังรับน้ำหนักฐานรากตื้นจากคุณสมบัติดิน (φ, c, γ) และรูปทรงฐานราก",
    category: "Civil",
    standard: "General Bearing Capacity Equation",
  },
  {
    href: "/renewable-energy",
    title: "Renewable Energy: Solar PV & Wind Turbine",
    description:
      "คำนวณขนาดระบบโซลาร์เซลล์ที่ต้องการ และกำลังผลิตของกังหันลมจากความเร็วลม",
    category: "Renewable Energy",
    standard: "PVWatts Method / Betz Limit",
  },
  {
    href: "/fatigue-analysis",
    title: "Fatigue Analysis (Modified Goodman)",
    description:
      "ประมาณ Endurance Limit ด้วย Marin Equation และตรวจสอบ Safety Factor ด้วยเกณฑ์ Goodman",
    category: "Machine Design",
    standard: "Marin Equation / Modified Goodman",
  },
  {
    href: "/ship-stability",
    title: "Ship Stability: Metacentric Height",
    description:
      "คำนวณ GM เบื้องต้นของตัวเรือทรงกล่อง เทียบกับเกณฑ์ขั้นต่ำ IMO IS Code 2008",
    category: "Marine",
    standard: "IMO IS Code 2008",
  },
  {
    href: "/slope-stability",
    title: "Slope Stability (Infinite Slope)",
    description:
      "คำนวณ Factor of Safety ของลาดดิน/หน้าเหมืองด้วยวิธี Infinite Slope",
    category: "Mining",
    standard: "Infinite Slope Method",
  },
];
