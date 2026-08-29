import type { Metadata } from "next";
import RcBeamDesignCalculator from "@/components/RcBeamDesignCalculator";

export const metadata: Metadata = {
  title: "RC Beam Flexural Design (ACI 318)",
  description:
    "ออกแบบกำลังรับโมเมนต์ดัดของคานคอนกรีตเสริมเหล็กหน้าตัดสี่เหลี่ยม ด้วยวิธี Whitney Stress Block ตาม ACI 318",
};

export default function RcBeamDesignPage() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <RcBeamDesignCalculator />
    </div>
  );
}
