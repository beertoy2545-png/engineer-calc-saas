import type { Metadata } from "next";
import RadiationPhysicsCalculator from "@/components/RadiationPhysicsCalculator";

export const metadata: Metadata = {
  title: "Radiation Physics: Decay & Shielding",
  description:
    "คำนวณการสลายตัวของสารกัมมันตรังสี (Radioactive Decay) และการลดทอนรังสีผ่านวัสดุกำบัง (Shielding Attenuation)",
};

export default function RadiationPhysicsPage() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <RadiationPhysicsCalculator />
    </div>
  );
}
