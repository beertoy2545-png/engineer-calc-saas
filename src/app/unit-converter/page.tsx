import type { Metadata } from "next";
import UnitConverter from "@/components/UnitConverter";

export const metadata: Metadata = {
  title: "Unit Converter",
  description:
    "แปลงหน่วยวิศวกรรมที่ใช้บ่อย ความยาว พื้นที่ ปริมาตร มวล แรง ความดัน พลังงาน กำลัง อัตราการไหล ความเร็ว และอุณหภูมิ",
};

export default function UnitConverterPage() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <UnitConverter />
    </div>
  );
}
