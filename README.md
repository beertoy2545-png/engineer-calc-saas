# Engineer Calc

เครื่องมือคำนวณวิศวกรรมออนไลน์ฟรี สำหรับวิศวกรทุกสาขา — สูตรและข้อมูลอ้างอิงดึงมาจากเอกสารวิชาการและมาตรฐานสากลจริง
(ME444 Engineering Piping System Design, ME310 Mechanical Design จากมหาวิทยาลัยธรรมศาสตร์, IEC 60364-5-52,
และตำรากลศาสตร์วัสดุมาตรฐาน) ทุกขั้นตอนการคำนวณแสดงให้ตรวจสอบได้ ไม่ใช่กล่องดำ

⚠️ **ทุกเครื่องมือเป็นเครื่องมือช่วยประมาณการเบื้องต้นเท่านั้น** ไม่ใช่การคำนวณที่ผ่านการรับรองทางวิศวกรรม
ก่อนนำผลลัพธ์ไปใช้ออกแบบหรือก่อสร้างจริง ต้องให้วิศวกรที่มีใบอนุญาตตรวจสอบทุกครั้ง

## เครื่องมือที่มีอยู่

| เครื่องมือ | สาขา | อ้างอิง |
|---|---|---|
| Cooling Load | HVAC | Rule-of-thumb estimation |
| Pipe Sizing | Piping | ME444 — Darcy-Weisbach / Swamee-Jain |
| Pump Head, Power & NPSH | Piping | ME444 Chapter 6 |
| Steam Flow & Pipe Sizing | Piping | ME444 Chapter 11-12 |
| Shaft Design | Machine Design | ME310 — ASME Code Method |
| Cable Sizing & Voltage Drop | Electrical | IEC 60364-5-52 |
| Beam Bending & Deflection | Structural | Euler-Bernoulli Beam Theory |
| Heat Exchanger Sizing | Chemical / Process | LMTD Method |
| 2D Truss Analysis (interactive canvas) | Structural | Matrix Stiffness Method (numerical solver) |
| Unit Converter | Utilities | SI/Imperial standard constants |
| Statistics & Regression | Utilities | Least-Squares Linear Regression |
| RC Beam Flexural Design | Civil | ACI 318 — Whitney Stress Block |
| Clarifier / Sedimentation Tank Sizing | Environmental | Metcalf & Eddy Design Criteria |
| Control Systems: Response & PID Tuning | Control Systems | Ziegler-Nichols Tuning Method |
| Rocket Propulsion & Orbital Mechanics | Aerospace | Tsiolkovsky Rocket Equation |
| Engineering Economics | Industrial | Time Value of Money (NPV/IRR/Break-Even) |
| Petroleum: Reserves & Well Inflow | Petroleum | Volumetric Method / Darcy Radial Flow |
| Biomechanics: Joint Static Equilibrium | Biomedical | Static Equilibrium Analysis |
| Vehicle Braking & Weight Transfer | Automotive | Rigid-Body Vehicle Dynamics |
| Shallow Foundation Bearing Capacity | Civil | General Bearing Capacity Equation |
| Renewable Energy: Solar PV & Wind Turbine | Renewable Energy | PVWatts Method / Betz Limit |
| Fatigue Analysis (Modified Goodman) | Machine Design | Marin Equation / Modified Goodman |

## Getting Started

```bash
npm install
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000)

## คำสั่งที่ใช้บ่อย

```bash
npm run dev      # dev server
npm run build    # production build
npm run lint     # eslint
npm run test     # vitest — unit tests สำหรับทุกสูตรคำนวณ
```

## โครงสร้างโปรเจกต์

```
src/
  app/                 # หน้าเว็บแต่ละเครื่องมือ (Next.js App Router)
  components/          # UI components
    ui/                # ส่วนประกอบที่ใช้ร่วมกันทุกเครื่องมือ
  lib/
    calculations/       # ตรรกะคำนวณล้วนๆ + unit tests (*.test.ts)
    tools.ts            # รายชื่อเครื่องมือทั้งหมด (ใช้ร่วมกันโดย nav และหน้าแรก)
```

สูตรคำนวณทุกตัวแยกไว้ใน `src/lib/calculations/` เป็นไฟล์ `.ts` ล้วน (ไม่ผูกกับ React)
พร้อม comment อ้างอิงแหล่งที่มาของสูตรกำกับไว้ที่หัวไฟล์ — ให้วิศวกรที่ปรึกษาตรวจสอบได้ง่าย

## เพิ่มเครื่องมือใหม่

1. สร้างไฟล์คำนวณใน `src/lib/calculations/<name>.ts` พร้อม comment อ้างอิงแหล่งสูตร
2. เขียน `*.test.ts` คู่กัน — อย่างน้อยควรมี regression test จากตัวอย่างที่คำนวณด้วยมือหรือจากหนังสือ
3. สร้าง UI component ใน `src/components/` โดยใช้ `NumberField` และ `WarningBanner` จาก `src/components/ui/`
4. เพิ่ม route ใหม่ใน `src/app/<name>/page.tsx` พร้อม `metadata` (title, description)
5. เพิ่มรายการเครื่องมือใหม่ใน `src/lib/tools.ts`
