/**
 * `@db.Date` 컬럼과 `YYYY-MM-DD` 문자열 사이를 오간다.
 *
 * 하루의 경계는 사용자 로컬 날짜이고, 이벤트 시각은 절대시각이다.
 * 이 둘을 섞으면 타임존이 다른 사용자의 잔디가 하루씩 밀린다. (06-database.md 5.3)
 */

export function toDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function fromDateOnly(isoDate: string): Date {
  return new Date(`${isoDate}T00:00:00.000Z`);
}
