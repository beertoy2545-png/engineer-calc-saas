import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import SiteNav from "@/components/SiteNav";
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
        {children}
      </body>
    </html>
  );
}
