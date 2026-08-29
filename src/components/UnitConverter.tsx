"use client";

import { useMemo, useState } from "react";
import {
  UNIT_CATEGORIES,
  convertUnit,
  type UnitCategory,
} from "@/lib/calculations/unitConverter";
import { fmt } from "@/lib/format";

const CATEGORY_KEYS = Object.keys(UNIT_CATEGORIES) as UnitCategory[];

export default function UnitConverter() {
  const [category, setCategory] = useState<UnitCategory>("pressure");
  const units = UNIT_CATEGORIES[category].units;

  const [fromKey, setFromKey] = useState(units[0].key);
  const [toKey, setToKey] = useState(units[1]?.key ?? units[0].key);
  const [value, setValue] = useState(1);

  const result = useMemo(
    () => convertUnit(category, value, fromKey, toKey),
    [category, value, fromKey, toKey],
  );

  const onCategoryChange = (key: UnitCategory) => {
    setCategory(key);
    const newUnits = UNIT_CATEGORIES[key].units;
    setFromKey(newUnits[0].key);
    setToKey(newUnits[1]?.key ?? newUnits[0].key);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-slate-900">
        แปลงหน่วยวิศวกรรม (Unit Converter)
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        แปลงหน่วยที่ใช้บ่อยในงานวิศวกรรม ความยาว พื้นที่ ปริมาตร มวล แรง ความดัน
        พลังงาน กำลัง อัตราการไหล ความเร็ว และอุณหภูมิ
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {CATEGORY_KEYS.map((key) => (
          <button
            key={key}
            onClick={() => onCategoryChange(key)}
            className={`rounded-full px-3 py-1.5 text-sm ${
              category === key
                ? "bg-slate-900 text-white"
                : "border border-slate-300 text-slate-600 hover:bg-slate-100"
            }`}
          >
            {UNIT_CATEGORIES[key].label}
          </button>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-[1fr_auto_1fr]">
          <div className="space-y-2">
            <label className="text-sm text-slate-700">จาก</label>
            <input
              type="number"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-lg text-slate-900"
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
            />
            <select
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900"
              value={fromKey}
              onChange={(e) => setFromKey(e.target.value)}
            >
              {units.map((u) => (
                <option key={u.key} value={u.key}>
                  {u.label}
                </option>
              ))}
            </select>
          </div>

          <div className="hidden items-center justify-center text-slate-400 sm:flex">
            →
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-700">เป็น</label>
            <div className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-lg font-semibold text-slate-900">
              {fmt(result, 6)}
            </div>
            <select
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900"
              value={toKey}
              onChange={(e) => setToKey(e.target.value)}
            >
              {units.map((u) => (
                <option key={u.key} value={u.key}>
                  {u.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={() => {
            const oldFrom = fromKey;
            setFromKey(toKey);
            setToKey(oldFrom);
          }}
          className="mt-4 rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
        >
          ⇄ สลับหน่วย
        </button>
      </div>
    </div>
  );
}
