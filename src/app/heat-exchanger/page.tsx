import type { Metadata } from "next";
import HeatExchangerCalculator from "@/components/HeatExchangerCalculator";

export const metadata: Metadata = {
  title: "Heat Exchanger Sizing Calculator (LMTD)",
  description:
    "คำนวณพื้นที่แลกเปลี่ยนความร้อนที่ต้องการด้วยวิธี LMTD เปรียบเทียบ Counterflow กับ Parallel Flow",
};

export default function HeatExchangerPage() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <HeatExchangerCalculator />
    </div>
  );
}
