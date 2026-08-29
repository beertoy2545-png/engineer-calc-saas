import type { Metadata } from "next";
import RenewableEnergyCalculator from "@/components/RenewableEnergyCalculator";

export const metadata: Metadata = {
  title: "Renewable Energy: Solar PV & Wind Turbine",
  description:
    "คำนวณขนาดระบบโซลาร์เซลล์ที่ต้องการ (Solar PV Sizing) และกำลังผลิตของกังหันลม (Wind Turbine Power)",
};

export default function RenewableEnergyPage() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <RenewableEnergyCalculator />
    </div>
  );
}
