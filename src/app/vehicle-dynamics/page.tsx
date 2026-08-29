import type { Metadata } from "next";
import VehicleDynamicsCalculator from "@/components/VehicleDynamicsCalculator";

export const metadata: Metadata = {
  title: "Vehicle Braking & Weight Transfer",
  description:
    "คำนวณระยะเบรก (Reaction + Braking Distance) และการถ่ายน้ำหนักระหว่างเบรกกะทันหันจากมวลรถ ความสูง CG และฐานล้อ",
};

export default function VehicleDynamicsPage() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <VehicleDynamicsCalculator />
    </div>
  );
}
