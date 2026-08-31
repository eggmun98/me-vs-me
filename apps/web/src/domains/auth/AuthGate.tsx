"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { getAccessToken, restoreSession } from "@nadaena/api-client";

const PUBLIC_PATHS = ["/login", "/auth/callback", "/demo"];
const LANDING_PATH = "/";

/**
 * 새로고침하면 메모리의 access 토큰이 사라진다.
 * httpOnly 쿠키의 refresh 로 한 번 되살려보고, 안 되면 로그인으로 보낸다.
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isPublic =
    pathname === LANDING_PATH || PUBLIC_PATHS.some((path) => pathname.startsWith(path));
  // 공개 경로는 확인할 게 없다. 부팅 화면이 깜빡이지 않게 처음부터 false 로 둔다.
  const [isChecking, setIsChecking] = useState(!isPublic);

  useEffect(() => {
    if (isPublic) return;

    if (getAccessToken()) {
      setIsChecking(false);
      return;
    }

    void restoreSession().then((restored) => {
      if (!restored) router.replace("/login");
      setIsChecking(false);
    });
  }, [isPublic, router]);

  if (isChecking) return <BootScreen />;

  return <>{children}</>;
}

function BootScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <span className="text-sm text-content-dim">불러오는 중…</span>
    </div>
  );
}
