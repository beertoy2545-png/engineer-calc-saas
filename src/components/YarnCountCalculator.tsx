"use client";

import { useMemo, useState } from "react";
import {
  calculateFabricAreaDensity,
  convertYarnCount,
  type YarnCountSystem,
} from "@/lib/calculations/yarnCount";
import { NumberField } from "@/components/ui/NumberField";
import { WarningBanner } from "@/components/ui/WarningBanner";
import { fmt } from "@/lib/format";

const SYSTEM_LABEL: Record<YarnCountSystem, string> = {
  tex: "Tex (g / 1000m)",
  denier: "Denier (g / 9000m)",
  ne: "Ne — English Cotton Count (hanks/lb)",
  nm: "Nm — Metric Count (km/kg)",
};

export default function YarnCountCalculator() {
  const [value, setValue] = useState(30);
  const [system, setSystem] = useState<YarnCountSystem>("ne");
  const result = useMemo(() => convertYarnCount(value, system), [value, system]);

  const [sampleMassG, setSampleMassG] = useState(1.5);
  const [sampleAreaM2, setSampleAreaM2] = useState(0.01);
  const [fabricWidthM, setFabricWidthM] = useState(1.5);
  const gsmResult = useMemo(
    () => calculateFabricAreaDensity({ sampleMassG, sampleAreaM2, fabricWidthM }),
    [sampleMassG, sampleAreaM2, fabricWidthM],
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-slate-900">
        สิ่งทอ (Textile — Yarn Count &amp; Fabric Weight)
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        แปลงระบบเบอร์ด้าย (Tex, Denier, Ne, Nm) และคำนวณน้ำหนักผ้าต่อพื้นที่ (GSM)
      </p>

      <WarningBanner>
        ⚠️ การแปลงเบอร์ด้ายเป็นการแปลงหน่วยตามนิยามมาตรฐาน (แม่นยำ 100%) ส่วน GSM คำนวณจาก
        มวล/พื้นที่ตัวอย่างโดยตรงเท่านั้น ไม่ใช่การประมาณจากโครงสร้างการทอ (จำนวนเส้นด้าย/ค่า
        Crimp) ซึ่งต้องพิจารณาลักษณะการทอเพิ่มเติม
      </WarningBanner>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Yarn count conversion */}
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-medium text-slate-900">แปลงเบอร์ด้าย (Yarn Count)</h2>
          <NumberField label="ค่า" value={value} step={0.1} onChange={setValue} />
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-slate-700">ระบบที่กรอก</span>
            <select
              className="rounded-md border border-slate-300 px-3 py-2 text-slate-900"
              value={system}
              onChange={(e) => setSystem(e.target.value as YarnCountSystem)}
            >
              {(Object.keys(SYSTEM_LABEL) as YarnCountSystem[]).map((key) => (
                <option key={key} value={key}>
                  {SYSTEM_LABEL[key]}
                </option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-md bg-slate-50 p-3">
              <div className="text-xs text-slate-500">Tex</div>
              <div className="font-medium text-slate-900">{fmt(result.tex, 3)}</div>
            </div>
            <div className="rounded-md bg-slate-50 p-3">
              <div className="text-xs text-slate-500">Denier</div>
              <div className="font-medium text-slate-900">{fmt(result.denier, 2)}</div>
            </div>
            <div className="rounded-md bg-slate-50 p-3">
              <div className="text-xs text-slate-500">Ne (English Cotton)</div>
              <div className="font-medium text-slate-900">{fmt(result.ne, 3)}</div>
            </div>
            <div className="rounded-md bg-slate-50 p-3">
              <div className="text-xs text-slate-500">Nm (Metric)</div>
              <div className="font-medium text-slate-900">{fmt(result.nm, 3)}</div>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            * Tex/Denier คือระบบทางตรง (ยิ่งมากยิ่งหยาบ) · Ne/Nm คือระบบทางอ้อม (ยิ่งมากยิ่งละเอียด)
          </p>
        </div>

        {/* Fabric GSM */}
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-medium text-slate-900">น้ำหนักผ้า (Fabric GSM)</h2>
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label="มวลตัวอย่าง"
              unit="g"
              value={sampleMassG}
              step={0.1}
              onChange={setSampleMassG}
            />
            <NumberField
              label="พื้นที่ตัวอย่าง"
              unit="m²"
              value={sampleAreaM2}
              step={0.001}
              onChange={setSampleAreaM2}
            />
          </div>
          <NumberField
            label="ความกว้างผ้าจริง"
            unit="m"
            value={fabricWidthM}
            step={0.05}
            onChange={setFabricWidthM}
          />
          <p className="text-xs text-slate-400">
            * ตัวอย่างมาตรฐานมักตัดขนาด 10cm×10cm = 0.01 m²
          </p>

          <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-4">
            <div className="text-sm text-emerald-800">GSM (g/m²)</div>
            <div className="text-2xl font-semibold text-emerald-900">
              {fmt(gsmResult.gsm, 1)}
            </div>
            <div className="mt-1 text-xs text-emerald-800">
              น้ำหนักต่อความยาว = {fmt(gsmResult.linearWeightGM, 1)} g/m (
              {fmt(gsmResult.linearWeightKgM, 3)} kg/m)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
