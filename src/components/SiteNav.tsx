"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TOOLS } from "@/lib/tools";

export default function SiteNav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto px-4 py-3">
        <Link
          href="/"
          className="mr-4 shrink-0 text-sm font-semibold text-slate-900"
        >
          Engineer Calc
        </Link>
        {TOOLS.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className={`shrink-0 rounded-md px-3 py-1.5 text-sm ${
              pathname === tool.href
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {tool.title}
          </Link>
        ))}
      </div>
    </nav>
  );
}
