"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const NAV = [
  { href: "/today", label: "오늘" },
  { href: "/record", label: "기록" },
  { href: "/my", label: "MY" },
] as const;

const BARE_PATHS = ["/login", "/auth/", "/onboarding", "/demo"];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // 랜딩·로그인·온보딩·둘러보기는 사이드바 없이 보여준다.
  if (pathname === "/" || BARE_PATHS.some((path) => pathname.startsWith(path))) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}

function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-border bg-surface px-4 py-6">
      <div className="px-3 pb-8">
        <div className="text-[15px] font-bold tracking-tight">나 VS 나</div>
        <div className="mt-1 text-[11px] text-content-dim">오늘도 나와 싸운다</div>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV.map((item) => (
          <SidebarLink
            key={item.href}
            href={item.href}
            label={item.label}
            isActive={isActivePath(pathname, item.href)}
          />
        ))}
      </nav>

      <div className="mt-auto border-t border-border pt-4">
        <SidebarLink href="/my/settings" label="설정" isActive={false} />
      </div>
    </aside>
  );
}

function SidebarLink({
  href,
  label,
  isActive,
}: {
  href: string;
  label: string;
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      className={`rounded-lg px-3 py-2 text-sm transition-colors ${
        isActive
          ? "bg-accent font-semibold text-on-accent"
          : "text-content-muted hover:bg-surface-hover hover:text-content"
      }`}
    >
      {label}
    </Link>
  );
}

function isActivePath(pathname: string, href: string) {
  return pathname.startsWith(href);
}
