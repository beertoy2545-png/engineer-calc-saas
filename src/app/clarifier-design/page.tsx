import type { Metadata } from "next";
import ClarifierDesignCalculator from "@/components/ClarifierDesignCalculator";

export const metadata: Metadata = {
  title: "Clarifier / Sedimentation Tank Sizing",
  description:
    "ตรวจสอบขนาดถังตกตะกอนน้ำเสีย (Primary/Secondary Clarifier) เทียบกับเกณฑ์ SOR, HRT, Weir Loading Rate มาตรฐาน",
};

export default function ClarifierDesignPage() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <ClarifierDesignCalculator />
    </div>
  );
}
