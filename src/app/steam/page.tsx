import type { Metadata } from "next";
import SteamSizingCalculator from "@/components/SteamSizingCalculator";

export const metadata: Metadata = {
  title: "Steam Flow & Pipe Sizing Calculator",
  description:
    "คำนวณอัตราการไหลของไอน้ำจากภาระความร้อน (Heat Load) และเลือกขนาดท่อไอน้ำจากความเร็วแนะนำ",
};

export default function SteamPage() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <SteamSizingCalculator />
    </div>
  );
}
