import type { Metadata } from "next";
import ShaftDesignCalculator from "@/components/ShaftDesignCalculator";

export const metadata: Metadata = {
  title: "Shaft Design Calculator (ASME Code)",
  description:
    "คำนวณขนาดเพลาส่งกำลัง (Shaft Diameter) จากแรงบิดและโมเมนต์ดัด ตามวิธี ASME Code สำหรับวิศวกรเครื่องกล",
};

export default function ShaftDesignPage() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <ShaftDesignCalculator />
    </div>
  );
}
