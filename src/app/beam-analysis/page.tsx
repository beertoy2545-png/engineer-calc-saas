import type { Metadata } from "next";
import BeamAnalysisCalculator from "@/components/BeamAnalysisCalculator";

export const metadata: Metadata = {
  title: "Beam Bending Stress & Deflection Calculator",
  description:
    "คำนวณโมเมนต์ดัด ความเค้นดัด และ Deflection ของคานช่วงเดียวหรือคานยื่น ภายใต้โหลดจุดหรือโหลดแผ่สม่ำเสมอ",
};

export default function BeamAnalysisPage() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <BeamAnalysisCalculator />
    </div>
  );
}
