import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { AuthGate } from "@/domains/auth/AuthGate";
import { QueryProvider } from "@/shared/api/QueryProvider";
import { AppShell } from "@/shared/ui/AppShell";
import "./globals.css";

/** 하단 탭바가 아이폰 홈 인디케이터에 가리지 않으려면 safe-area 값을 받아야 한다. */
export const viewport: Viewport = {
	viewportFit: "cover",
};

export const metadata: Metadata = {
	title: "나 VS 나",
	description:
		"매일의 목표를 승패로 기록하며 나 자신과 경쟁하는 자기계발 서비스",
};

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="ko" className="h-full antialiased" suppressHydrationWarning>
			<head>
				<link
					rel="stylesheet"
					href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
				/>
			</head>
			<body className="min-h-full">
				<QueryProvider>
					<AuthGate>
						<AppShell>{children}</AppShell>
					</AuthGate>
				</QueryProvider>
			</body>
		</html>
	);
}
