"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DEPARTMENTS, SECTIONS } from "@/lib/aop/configs";

export default function AopLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="-m-4 flex min-h-[calc(100vh-56px)]">
      <aside className="w-[240px] shrink-0 bg-gray-900 text-white flex flex-col">
        <Link
          href="/aop"
          className={`px-6 py-5 border-b border-white/10 block hover:bg-white/5 transition-colors border-l-4 ${
            pathname === "/aop"
              ? "bg-black/40 border-l-white"
              : "border-l-transparent"
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
            const onDept = pathname === dept.href || pathname.startsWith(dept.href + "/");
            const onDeptRoot = pathname === dept.href;
            return (
              <div key={dept.href}>
                <Link
                  href={dept.href}
                  className={`flex items-center gap-4 px-6 py-3 text-sm transition-colors border-l-4 ${
                    onDeptRoot
                      ? "bg-black/40 border-l-white pl-5 text-white"
                      : onDept
                      ? "bg-black/20 border-l-transparent text-white"
                      : "border-l-transparent text-gray-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span className={`text-lg font-bold ${dept.accentText}`}>
                    {dept.number}
                  </span>
                  <span className="font-medium">{dept.name}</span>
                  {onDept && (
                    <span className={`ml-auto h-2 w-2 rounded-full ${dept.accentBg}`} />
                  )}
                </Link>

                {onDept && (
                  <div className="bg-black/20 py-1">
                    {SECTIONS.map((section) => {
                      const sectionHref = `${dept.href}/${section.slug}`;
                      const active = pathname === sectionHref;
                      return (
                        <Link
                          key={section.slug}
                          href={sectionHref}
                          className={`flex items-center gap-3 pl-14 pr-6 py-2 text-xs transition-colors border-l-4 ${
                            active
                              ? "border-l-white bg-black/40 text-white pl-[52px]"
                              : "border-l-transparent text-gray-400 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          <span
                            className={`h-1 w-1 rounded-full ${dept.accentBg} ${
                              active ? "opacity-100" : "opacity-50"
                            }`}
                          />
                          {section.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
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
