import type { Metadata } from "next";
import FatigueAnalysisCalculator from "@/components/FatigueAnalysisCalculator";

export const metadata: Metadata = {
  title: "Fatigue Analysis (Modified Goodman)",
  description:
    "ประมาณค่า Endurance Limit ด้วย Marin Equation และตรวจสอบ Safety Factor ด้วยเกณฑ์ Modified Goodman",
};

export default function FatigueAnalysisPage() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <FatigueAnalysisCalculator />
    </div>
  );
}
