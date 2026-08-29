import type { Metadata } from "next";
import AerospaceCalculator from "@/components/AerospaceCalculator";

export const metadata: Metadata = {
  title: "Rocket Propulsion & Orbital Mechanics",
  description:
    "คำนวณ Δv ด้วยสมการจรวด Tsiolkovsky และความเร็ว/คาบวงโคจรวงกลมด้วยกลศาสตร์วงโคจรสองวัตถุ",
};

export default function AerospacePage() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <AerospaceCalculator />
    </div>
  );
}
