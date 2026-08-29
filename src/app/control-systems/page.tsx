import type { Metadata } from "next";
import ControlSystemsCalculator from "@/components/ControlSystemsCalculator";

export const metadata: Metadata = {
  title: "Control Systems: Response & PID Tuning",
  description:
    "วิเคราะห์การตอบสนองระบบอันดับสอง (overshoot, settling time) และปรับจูน PID ด้วยวิธี Ziegler-Nichols",
};

export default function ControlSystemsPage() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <ControlSystemsCalculator />
    </div>
  );
}
