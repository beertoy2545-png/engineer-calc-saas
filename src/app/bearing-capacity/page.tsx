import type { Metadata } from "next";
import BearingCapacityCalculator from "@/components/BearingCapacityCalculator";

export const metadata: Metadata = {
  title: "Shallow Foundation Bearing Capacity",
  description:
    "คำนวณกำลังรับน้ำหนักของฐานรากตื้น (General Bearing Capacity Equation) จากคุณสมบัติดินและรูปทรงฐานราก",
};

export default function BearingCapacityPage() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <BearingCapacityCalculator />
    </div>
  );
}
