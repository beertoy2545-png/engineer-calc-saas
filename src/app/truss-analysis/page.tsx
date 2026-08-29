import type { Metadata } from "next";
import TrussAnalysisCalculator from "@/components/TrussAnalysisCalculator";

export const metadata: Metadata = {
  title: "2D Truss Analysis (Direct Stiffness Method)",
  description:
    "วิเคราะห์โครงถัก 2 มิติด้วยวิธี Direct Stiffness Method — กำหนดจุดต่อ ชิ้นส่วน และโหลดเอง คำนวณแรงในชิ้นส่วนและการเคลื่อนตัว",
};

export default function TrussAnalysisPage() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <TrussAnalysisCalculator />
    </div>
  );
}
