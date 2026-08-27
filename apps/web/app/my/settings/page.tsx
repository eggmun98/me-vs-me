"use client";

import { useRouter } from "next/navigation";
import { logout } from "@/domains/auth/authApi";
import { Field, inputClassName } from "@/shared/ui/Field";

const TIMEZONES = ["Asia/Seoul", "Asia/Tokyo", "America/New_York", "Europe/London", "UTC"];

export default function SettingsPage() {
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.replace("/");
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <h1 className="mb-5 text-lg font-bold">설정</h1>

      <div className="flex flex-col gap-4">
        <section className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="mb-4 text-xs font-semibold text-content-dim">프로필</h2>
          <div className="flex flex-col gap-4">
            <Field label="닉네임">
              <input defaultValue="문성진" className={inputClassName} />
            </Field>
            <Field label="소개">
              <input defaultValue="오늘도 나와 싸운다" className={inputClassName} />
            </Field>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="mb-4 text-xs font-semibold text-content-dim">하루의 기준</h2>
          <Field
            label="타임존"
            hint="바꾸면 오늘부터 적용됩니다. 지난 기록의 날짜는 바뀌지 않습니다."
          >
            <select defaultValue="Asia/Seoul" className={inputClassName}>
              {TIMEZONES.map((zone) => (
                <option key={zone} value={zone}>
                  {zone}
                </option>
              ))}
            </select>
          </Field>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="mb-4 text-xs font-semibold text-content-dim">계정</h2>
          <div className="flex flex-col gap-2 text-sm">
            <button
              type="button"
              onClick={handleLogout}
              className="self-start text-content-muted transition-colors hover:text-content"
            >
              로그아웃
            </button>
            <button
              type="button"
              className="self-start text-content-dim transition-colors hover:text-content"
            >
              회원 탈퇴
            </button>
          </div>
        </section>

        <p className="text-[11px] text-content-dim">알림 설정은 Phase 2에서 추가됩니다.</p>
      </div>
    </div>
  );
}
