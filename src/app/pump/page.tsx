import type { Metadata } from "next";
import PumpCalculator from "@/components/PumpCalculator";

export const metadata: Metadata = {
  title: "Pump Head, Power & NPSH Calculator",
  description:
    "คำนวณ Total Dynamic Head, กำลังมอเตอร์ปั๊มน้ำ และตรวจสอบความเสี่ยง Cavitation (NPSH Available vs Required)",
};

export default function PumpPage() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <PumpCalculator />
    </div>
  );
}
