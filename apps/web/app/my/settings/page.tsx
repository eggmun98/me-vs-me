"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ApiRequestError, logout, type Me, useMe, useUpdateMe } from "@nadaena/api-client";
import { Field, inputClassName } from "@/shared/ui/Field";
import { QueryState } from "@/shared/ui/QueryState";

const TIMEZONES = ["Asia/Seoul", "Asia/Tokyo", "America/New_York", "Europe/London", "UTC"];

export default function SettingsPage() {
  const router = useRouter();
  const { data: me, isLoading, error } = useMe();

  async function handleLogout() {
    await logout();
    router.replace("/");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="mb-5 text-lg font-bold">설정</h1>

      <div className="flex flex-col gap-4">
        <QueryState isLoading={isLoading} error={error}>
          {me && <ProfileForm me={me} />}
        </QueryState>

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

function ProfileForm({ me }: { me: Me }) {
  const updateMe = useUpdateMe();
  const [nickname, setNickname] = useState(me.nickname);
  const [bio, setBio] = useState(me.bio ?? "");
  const [timezone, setTimezone] = useState(me.timezone);
  const [error, setError] = useState<string | null>(null);

  const isDirty =
    nickname.trim() !== me.nickname || bio.trim() !== (me.bio ?? "") || timezone !== me.timezone;

  function handleSave() {
    setError(null);
    updateMe.mutate(
      { nickname: nickname.trim(), bio: bio.trim(), timezone },
      {
        // 닉네임은 unique 다. 중복이면 서버가 거절한다. (06-database 8.3)
        onError: (caught) =>
          setError(caught instanceof ApiRequestError ? caught.message : "저장하지 못했습니다."),
      },
    );
  }

  return (
    <>
      <section className="rounded-2xl border border-border bg-surface p-5">
        <h2 className="mb-4 text-xs font-semibold text-content-dim">프로필</h2>
        <div className="flex flex-col gap-4">
          <Field label="닉네임" hint="공개 프로필 주소에 쓰입니다.">
            <input
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
              maxLength={20}
              className={inputClassName}
            />
          </Field>
          <Field label="소개">
            <input
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              placeholder="오늘도 나와 싸운다"
              className={inputClassName}
            />
          </Field>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-5">
        <h2 className="mb-4 text-xs font-semibold text-content-dim">하루의 기준</h2>
        <Field
          label="타임존"
          hint="바꾸면 오늘부터 적용됩니다. 지난 기록의 날짜는 바뀌지 않습니다."
        >
          <select
            value={timezone}
            onChange={(event) => setTimezone(event.target.value)}
            className={inputClassName}
          >
            {TIMEZONES.map((zone) => (
              <option key={zone} value={zone}>
                {zone}
              </option>
            ))}
          </select>
        </Field>
      </section>

      {error && <p className="text-sm text-lose">{error}</p>}

      <button
        type="button"
        onClick={handleSave}
        disabled={!isDirty || nickname.trim().length === 0 || updateMe.isPending}
        className="self-start rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-on-accent transition-opacity hover:opacity-85 disabled:opacity-40"
      >
        {updateMe.isPending ? "저장 중…" : "저장"}
      </button>
    </>
  );
}
