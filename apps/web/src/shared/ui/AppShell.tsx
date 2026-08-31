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

      {/* 하단 탭바가 콘텐츠 마지막 줄을 가리지 않게 그만큼 비운다. */}
      <main className="min-w-0 flex-1 pb-[calc(3.5rem+env(safe-area-inset-bottom))] md:pb-0">
        {children}
      </main>

      <MobileTabBar />
    </div>
  );
}

function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-56 shrink-0 flex-col border-r border-border bg-surface px-4 py-6 md:flex">
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

/**
 * 좁은 화면에서는 사이드바가 사라진다. 대신 하단 탭바를 둔다.
 *
 * 없으면 오늘·기록·MY 사이를 오갈 방법이 아예 없다.
 * 앱과 같은 자리에 같은 세 항목을 둔다 — 웹으로 먼저 쓴 사람이 앱에서 헤매지 않는다.
 * 설정은 MY 안에 있어 탭에 올리지 않는다.
 */
function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] md:hidden">
      {NAV.map((item) => {
        const isActive = isActivePath(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={`relative flex-1 py-3.5 text-center text-xs transition-colors ${
              isActive ? "font-semibold text-content" : "text-content-dim"
            }`}
          >
            {isActive && (
              <span className="absolute inset-x-0 top-0 mx-auto h-0.5 w-8 rounded-full bg-accent" />
            )}
            {item.label}
          </Link>
        );
      })}
    </nav>
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
