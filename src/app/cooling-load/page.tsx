import type { Metadata } from "next";
import CoolingLoadCalculator from "@/components/CoolingLoadCalculator";

export const metadata: Metadata = {
  title: "Cooling Load Calculator",
  description:
    "คำนวณภาระความเย็น (Cooling Load) และประมาณขนาดเครื่องปรับอากาศที่เหมาะสมสำหรับห้อง ฟรี ไม่ต้องสมัครสมาชิก",
};

export default function CoolingLoadPage() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <CoolingLoadCalculator />
    </div>
  );
}
