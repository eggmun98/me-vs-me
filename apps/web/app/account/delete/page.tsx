import { ACCOUNT_RETENTION_DAYS } from "@nadaena/core";
import type { Metadata } from "next";
import Link from "next/link";
import { OPERATOR } from "@/domains/legal/operator";

export const metadata: Metadata = {
  title: "계정 삭제 — 나 VS 나",
};

/**
 * 계정 삭제 안내.
 *
 * 앱 안에서 탈퇴할 수 있는데도 이 페이지가 따로 필요하다. 구글 플레이의 데이터 삭제
 * 정책은 **앱을 이미 지운 사람**도 삭제를 요청할 수 있도록, 앱 밖에서 접근 가능한
 * 주소를 요구한다. 스토어 등록 정보에 이 주소를 적는다.
 */
export default function AccountDeletePage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-8 border-b border-border pb-6">
        <h1 className="text-xl font-bold">계정 삭제</h1>
        <p className="mt-2 text-sm text-content-muted">
          「{OPERATOR.serviceName}」 계정과 기록을 지우는 방법을 안내합니다.
        </p>
      </header>

      <div className="flex flex-col gap-8">
        <section className="flex flex-col gap-3">
          <h2 className="text-[15px] font-bold">앱이나 웹에서 직접 탈퇴하기</h2>
          <ol className="flex list-decimal flex-col gap-2 pl-5 text-sm leading-relaxed text-content-muted marker:text-content-dim">
            <li>서비스에 로그인합니다.</li>
            <li>
              <span className="font-semibold text-content">MY → 설정</span> 으로 들어갑니다.
            </li>
            <li>
              <span className="font-semibold text-content">회원 탈퇴</span> 를 누르고 안내에 따라
              확인합니다.
            </li>
          </ol>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-[15px] font-bold">앱을 이미 지웠다면</h2>
          <p className="text-sm leading-relaxed text-content-muted">
            앱을 삭제하면 계정은 남아 있습니다. 다시 설치하지 않고 지우고 싶다면 아래 주소로
            요청해 주세요. 본인 확인을 위해{" "}
            <span className="font-semibold text-content">
              가입에 사용한 소셜 계정의 이메일 주소
            </span>{" "}
            로 보내주셔야 합니다.
          </p>
          <p className="rounded-lg border border-border bg-surface px-4 py-3 text-sm font-semibold">
            {OPERATOR.contactEmail}
          </p>
          <p className="text-sm leading-relaxed text-content-muted">
            요청을 받으면 지체 없이, 늦어도 10일 이내에 처리하고 결과를 알려 드립니다.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-[15px] font-bold">무엇이 지워지나요</h2>
          <ul className="flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-content-muted marker:text-content-dim">
            <li>계정 정보 — 닉네임, 소개글, 시간대, 프로필 이미지 주소</li>
            <li>소셜 로그인 연결 — 카카오 회원번호 또는 구글 계정 고유 ID, 이메일 주소</li>
            <li>미션과 모든 일별 승패 기록, 연승과 통계</li>
            <li>로그인 세션 정보</li>
          </ul>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-[15px] font-bold">언제 지워지나요</h2>
          <p className="text-sm leading-relaxed text-content-muted">
            탈퇴하면 계정과 기록의 이용이{" "}
            <span className="font-semibold text-content">즉시 중지</span>
            되고, <span className="font-semibold text-content">{ACCOUNT_RETENTION_DAYS}일</span> 이
            지나면 완전히 삭제됩니다. 이 기간을 두는 것은 실수로 탈퇴한 경우 되돌릴 수 있게 하기
            위해서입니다.
          </p>
          <p className="text-sm leading-relaxed text-content-muted">
            {ACCOUNT_RETENTION_DAYS}일 안에 같은 소셜 계정으로 다시 로그인하면 기록이 그대로
            되살아납니다. 기간이 지나 삭제된 뒤에는 어떤 방법으로도 복구할 수 없습니다.
          </p>
        </section>

        <section className="flex flex-col gap-2 border-t border-border pt-6 text-sm">
          <Link href="/privacy" className="text-content-muted transition-colors hover:text-content">
            개인정보처리방침
          </Link>
          <Link href="/terms" className="text-content-muted transition-colors hover:text-content">
            이용약관
          </Link>
        </section>
      </div>
    </article>
  );
}
