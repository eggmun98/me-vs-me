"use client";

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

				{error && (
					<p className="mt-5 rounded-lg border border-border bg-surface px-3 py-2.5 text-xs leading-relaxed text-content-muted">
						{error}
					</p>
				)}
			</div>
		</main>
	);
}
