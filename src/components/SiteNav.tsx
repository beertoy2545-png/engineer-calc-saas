"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Cooling Load" },
  { href: "/pipe-sizing", label: "Pipe Sizing" },
  { href: "/pump", label: "Pump" },
  { href: "/shaft-design", label: "Shaft Design" },
];

export default function SiteNav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center gap-1 px-4 py-3">
        <span className="mr-4 text-sm font-semibold text-slate-900">
          Engineer Calc
        </span>
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-md px-3 py-1.5 text-sm ${
              pathname === link.href
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
