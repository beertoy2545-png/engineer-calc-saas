import type { Metadata } from "next";
import PetroleumCalculator from "@/components/PetroleumCalculator";

export const metadata: Metadata = {
  title: "Petroleum: Reserves & Well Inflow",
  description:
    "คำนวณปริมาณสำรองน้ำมัน/ก๊าซด้วยวิธีปริมาตร (OOIP/OGIP) และอัตราการไหลเข้าหลุมด้วยกฎของ Darcy",
};

export default function PetroleumPage() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <PetroleumCalculator />
    </div>
  );
}
