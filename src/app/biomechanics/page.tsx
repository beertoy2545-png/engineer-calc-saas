import type { Metadata } from "next";
import BiomechanicsCalculator from "@/components/BiomechanicsCalculator";

export const metadata: Metadata = {
  title: "Biomechanics: Joint Static Equilibrium",
  description:
    "วิเคราะห์แรงกล้ามเนื้อและแรงปฏิกิริยาที่ข้อต่อด้วยหลัก Statics — เช่น ข้อศอกและกล้ามเนื้อ Biceps",
};

export default function BiomechanicsPage() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <BiomechanicsCalculator />
    </div>
  );
}
