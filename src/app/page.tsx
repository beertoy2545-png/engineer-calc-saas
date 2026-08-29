import Link from "next/link";
import { TOOLS } from "@/lib/tools";

const CATEGORIES = Array.from(new Set(TOOLS.map((t) => t.category)));

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center">
          <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
            เครื่องมือคำนวณวิศวกรรมสำหรับวิศวกรทุกสาขา
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-slate-500">
            เครื่องคำนวณที่อ้างอิงสูตรและมาตรฐานจากเอกสารวิชาการจริง ตรวจสอบได้
            ทุกขั้นตอนการคำนวณ ใช้งานฟรี ไม่ต้องสมัครสมาชิก
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        {CATEGORIES.map((category) => (
          <div key={category} className="mb-10">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">
              {category}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {TOOLS.filter((t) => t.category === category).map((tool) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="group flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-400 hover:shadow-md"
                >
                  <h3 className="font-medium text-slate-900 group-hover:text-slate-950">
                    {tool.title}
                  </h3>
                  <p className="mt-1 flex-1 text-sm text-slate-500">
                    {tool.description}
                  </p>
                  <p className="mt-3 text-xs text-slate-400">{tool.standard}</p>
                </Link>
              ))}
            </div>
          </div>
        ))}

        <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          ⚠️ ทุกเครื่องมือในเว็บนี้เป็นเครื่องมือช่วยประมาณการเบื้องต้นเท่านั้น
          ก่อนนำผลลัพธ์ไปใช้ออกแบบหรือก่อสร้างจริง กรุณาให้วิศวกรที่มีใบอนุญาตตรวจสอบอีกครั้งทุกครั้ง
        </div>
      </section>
    </div>
  );
}
