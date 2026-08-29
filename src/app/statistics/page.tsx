import type { Metadata } from "next";
import StatisticsCalculator from "@/components/StatisticsCalculator";

export const metadata: Metadata = {
  title: "Statistics & Linear Regression",
  description:
    "วิเคราะห์ข้อมูลวิจัย/ทดลอง สถิติเชิงพรรณนา (mean, median, SD) และการถดถอยเชิงเส้น (Least-Squares Linear Regression)",
};

export default function StatisticsPage() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <StatisticsCalculator />
    </div>
  );
}
