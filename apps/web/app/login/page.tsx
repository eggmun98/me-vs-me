"use client";

import Link from "next/link";
import type { SocialProviderId } from "@nadaena/api-client";
import { useState } from "react";
import { buildSocialLoginUrl } from "@/domains/auth/socialLoginUrl";
import { BrandLogo } from "@/shared/ui/BrandLogo";

export default function LoginPage() {
	const [error, setError] = useState<string | null>(null);

	function startLogin(provider: SocialProviderId) {
		try {
			window.location.href = buildSocialLoginUrl(provider);
		} catch (caught) {
			setError(
				caught instanceof Error
					? caught.message
					: "로그인을 시작하지 못했습니다.",
			);
		}
	}

	return (
		<main className="flex min-h-screen flex-col items-center justify-center px-6">
			<div className="w-full max-w-xs text-center">
				<BrandLogo size="hero" />
				<p className="mt-2 text-sm text-content-muted">오늘도 나와 싸운다.</p>

				<div className="mt-10 flex flex-col gap-2.5">
					<button
						type="button"
						onClick={() => startLogin("kakao")}
						className="rounded-xl bg-[#FEE500] px-4 py-3.5 text-sm font-semibold text-[#191600] transition-opacity hover:opacity-90"
					>
						카카오로 계속하기
					</button>
					<button
						type="button"
						onClick={() => startLogin("google")}
						className="rounded-xl border border-border-strong bg-surface px-4 py-3.5 text-sm font-semibold transition-colors hover:bg-surface-hover"
					>
						구글로 계속하기
					</button>
				</div>

				{/* 가입이 일어나는 지점이라 여기서 알린다. 설정 화면에만 두면 동의 전에 볼 수 없다. */}
				<p className="mt-6 text-[11px] leading-relaxed text-content-dim">
					계속하면{" "}
					<Link href="/terms" className="underline underline-offset-2 hover:text-content">
						이용약관
					</Link>
					과{" "}
					<Link href="/privacy" className="underline underline-offset-2 hover:text-content">
						개인정보처리방침
					</Link>
					에 동의하는 것으로 봅니다.
				</p>

				{error && (
					<p className="mt-5 rounded-lg border border-border bg-surface px-3 py-2.5 text-xs leading-relaxed text-content-muted">
						{error}
					</p>
				)}
			</div>
		</main>
	);
}
