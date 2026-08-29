import type { Metadata } from "next";
import ShipStabilityCalculator from "@/components/ShipStabilityCalculator";

export const metadata: Metadata = {
  title: "Ship Stability: Metacentric Height",
  description:
    "คำนวณ GM (Metacentric Height) เบื้องต้นของตัวเรือทรงกล่อง เทียบกับเกณฑ์ขั้นต่ำ IMO IS Code 2008",
};

export default function ShipStabilityPage() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <ShipStabilityCalculator />
    </div>
  );
}
