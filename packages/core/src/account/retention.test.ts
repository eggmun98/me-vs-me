import { describe, expect, it } from "vitest";
import { ACCOUNT_RETENTION_DAYS, purgeAfter, purgeCutoff } from "./retention";

describe("purgeAfter", () => {
  it("탈퇴 시각에서 보유기간만큼 뒤를 가리킨다", () => {
    expect(purgeAfter(new Date("2026-01-01T00:00:00Z")).toISOString()).toBe(
      "2026-01-31T00:00:00.000Z",
    );
  });

  it("달을 넘어가도 날짜가 밀리지 않는다", () => {
    expect(purgeAfter(new Date("2026-08-20T09:00:00Z")).toISOString()).toBe(
      "2026-09-19T09:00:00.000Z",
    );
  });

  it("건네준 값을 바꾸지 않는다", () => {
    const deletedAt = new Date("2026-03-10T00:00:00Z");
    purgeAfter(deletedAt);

    expect(deletedAt.toISOString()).toBe("2026-03-10T00:00:00.000Z");
  });
});

describe("purgeCutoff", () => {
  it("보유기간만큼 앞을 가리킨다 — 이보다 전에 탈퇴했으면 삭제 대상이다", () => {
    expect(purgeCutoff(new Date("2026-01-31T00:00:00Z")).toISOString()).toBe(
      "2026-01-01T00:00:00.000Z",
    );
  });

  it("탈퇴 직후 계정은 대상에 들어가지 않는다", () => {
    const now = new Date("2026-05-01T00:00:00Z");
    const justWithdrawn = new Date("2026-04-30T23:59:00Z");

    expect(justWithdrawn > purgeCutoff(now)).toBe(true);
  });

  it("보유기간을 하루 넘긴 계정은 대상에 들어간다", () => {
    const now = new Date("2026-05-01T00:00:00Z");
    const longGone = new Date("2026-03-31T00:00:00Z");

    expect(longGone < purgeCutoff(now)).toBe(true);
  });

  it("두 함수가 같은 기간을 본다", () => {
    const deletedAt = new Date("2026-06-01T00:00:00Z");

    expect(purgeAfter(deletedAt).getTime()).toBe(
      purgeCutoff(new Date(deletedAt.getTime() + 2 * ACCOUNT_RETENTION_DAYS * 86_400_000)).getTime(),
    );
  });
});
