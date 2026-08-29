import type { Metadata } from "next";
import EngineeringEconomicsCalculator from "@/components/EngineeringEconomicsCalculator";

export const metadata: Metadata = {
  title: "Engineering Economics: NPV, IRR & Break-Even",
  description:
    "ประเมินความคุ้มค่าโครงการทางวิศวกรรม NPV, IRR, Payback Period และจุดคุ้มทุน (Break-Even Analysis)",
};

export default function EngineeringEconomicsPage() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <EngineeringEconomicsCalculator />
    </div>
  );
}
