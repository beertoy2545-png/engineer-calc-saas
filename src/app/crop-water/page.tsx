import type { Metadata } from "next";
import CropWaterRequirementCalculator from "@/components/CropWaterRequirementCalculator";

export const metadata: Metadata = {
  title: "Crop Water Requirement & Irrigation Scheduling",
  description:
    "คำนวณความต้องการน้ำของพืชและรอบการให้น้ำด้วยวิธี FAO-56 Crop Coefficient (ETc = Kc × ETo)",
};

export default function CropWaterPage() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <CropWaterRequirementCalculator />
    </div>
  );
}
