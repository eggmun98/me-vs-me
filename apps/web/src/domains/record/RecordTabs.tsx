"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * 연간 잔디는 캘린더의 년 뷰가 담당한다.
 * 같은 것을 두 군데서 보게 하지 않는다.
 */
const TABS = [
  { href: "/record", label: "캘린더" },
  { href: "/record/stats", label: "통계" },
] as const;

export function RecordTabs() {
  const pathname = usePathname();

  return (
    <nav className="mb-5 flex gap-1">
      {TABS.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
            pathname === tab.href
              ? "bg-accent font-semibold text-on-accent"
              : "text-content-muted hover:bg-surface-hover hover:text-content"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
