import type { Metadata } from "next";
import SlopeStabilityCalculator from "@/components/SlopeStabilityCalculator";

export const metadata: Metadata = {
  title: "Slope Stability (Infinite Slope Method)",
  description:
    "คำนวณ Factor of Safety ของลาดดิน/หน้าเหมืองด้วยวิธี Infinite Slope จากค่า cohesion, มุมเสียดทาน และมุมลาด",
};

export default function SlopeStabilityPage() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <SlopeStabilityCalculator />
    </div>
  );
}
