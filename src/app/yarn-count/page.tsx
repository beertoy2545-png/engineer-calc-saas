import type { Metadata } from "next";
import YarnCountCalculator from "@/components/YarnCountCalculator";

export const metadata: Metadata = {
  title: "Textile: Yarn Count & Fabric Weight",
  description:
    "แปลงระบบเบอร์ด้าย (Tex, Denier, Ne, Nm) และคำนวณน้ำหนักผ้าต่อพื้นที่ (GSM)",
};

export default function YarnCountPage() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <YarnCountCalculator />
    </div>
  );
}
