import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import SiteNav from "@/components/SiteNav";
import ExportPdfButton from "@/components/ExportPdfButton";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Engineer Calc — เครื่องมือคำนวณวิศวกรรมออนไลน์",
    template: "%s | Engineer Calc",
  },
  description:
    "เครื่องมือคำนวณวิศวกรรมออนไลน์ฟรี ครอบคลุม HVAC, Piping, Pump, Machine Design อ้างอิงสูตรและมาตรฐานจากเอกสารวิชาการจริง",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="th"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SiteNav />
        <div className="hidden border-b border-slate-300 pb-2 text-xs text-slate-500 print:block">
          Engineer Calc — เครื่องมือคำนวณวิศวกรรมออนไลน์
        </div>
        {children}
        <ExportPdfButton />
      </body>
    </html>
  );
}
