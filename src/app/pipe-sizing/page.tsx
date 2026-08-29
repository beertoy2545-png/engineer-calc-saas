import type { Metadata } from "next";
import PipeSizingCalculator from "@/components/PipeSizingCalculator";

export const metadata: Metadata = {
  title: "Pipe Sizing Calculator",
  description:
    "คำนวณขนาดท่อน้ำจากอัตราการไหล เปรียบเทียบ Head Loss ทุกขนาดมาตรฐาน (Steel SCH40, PVC) ตามหลัก Darcy-Weisbach",
};

export default function PipeSizingPage() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <PipeSizingCalculator />
    </div>
  );
}
