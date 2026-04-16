"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Department = {
  number: string;
  name: string;
  href: string;
  accentText: string;
  accentBg: string;
};

const DEPARTMENTS: Department[] = [
  { number: "01", name: "CS", href: "/aop/cs", accentText: "text-sky-400", accentBg: "bg-sky-400" },
  { number: "02", name: "Sales", href: "/aop/sales", accentText: "text-emerald-400", accentBg: "bg-emerald-400" },
  { number: "03", name: "Partner", href: "/aop/partner", accentText: "text-amber-400", accentBg: "bg-amber-400" },
  { number: "04", name: "Support", href: "/aop/support", accentText: "text-violet-400", accentBg: "bg-violet-400" },
];

export default function AopLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="-m-4 flex min-h-[calc(100vh-56px)]">
      <aside className="w-[240px] shrink-0 bg-gray-900 text-white flex flex-col">
        <Link
          href="/aop"
          className={`px-6 py-5 border-b border-white/10 block hover:bg-white/5 transition-colors ${
            pathname === "/aop" ? "bg-black/40 border-l-4 border-l-white" : ""
          }`}
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gray-400">
            FY2026
          </p>
          <p className="mt-1 text-base font-semibold tracking-tight">
            Annual Operating Plan
          </p>
        </Link>

        <nav className="flex-1 py-4">
          <p className="px-6 pb-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-gray-500">
            Departments
          </p>
          {DEPARTMENTS.map((dept) => {
            const active = pathname === dept.href || pathname.startsWith(dept.href + "/");
            return (
              <Link
                key={dept.href}
                href={dept.href}
                className={`flex items-center gap-4 px-6 py-3 text-sm transition-colors ${
                  active
                    ? "bg-black/40 border-l-4 border-l-white pl-5 text-white"
                    : "border-l-4 border-l-transparent text-gray-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className={`text-lg font-bold ${dept.accentText}`}>{dept.number}</span>
                <span className="font-medium">{dept.name}</span>
                {active && (
                  <span className={`ml-auto h-2 w-2 rounded-full ${dept.accentBg}`} />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="px-6 py-4 border-t border-white/10 text-[11px] text-gray-500">
          Operating Plan · FY2026
        </div>
      </aside>

      <div className="flex-1 overflow-auto bg-[#050914]">{children}</div>
    </div>
  );
}
