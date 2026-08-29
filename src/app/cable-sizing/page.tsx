import type { Metadata } from "next";
import CableSizingCalculator from "@/components/CableSizingCalculator";

export const metadata: Metadata = {
  title: "Cable Sizing & Voltage Drop Calculator",
  description:
    "คำนวณขนาดสายไฟฟ้าและแรงดันตกตามมาตรฐาน IEC 60364-5-52 พร้อม correction factor อุณหภูมิและการมัดรวมสาย",
};

export default function CableSizingPage() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <CableSizingCalculator />
    </div>
  );
}
