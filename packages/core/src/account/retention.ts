/**
 * 탈퇴한 계정을 실제로 지우기까지 두는 기간.
 *
 * 이 기간 동안에는 데이터를 지우지 않고 잠가만 둔다. 다시 로그인하면 계정이 되살아나고,
 * 기간이 지나면 배치가 흔적까지 지운다. 잘못 눌러 탈퇴한 사람에게 되돌릴 길을 주기 위해서다.
 *
 * 개인정보처리방침에 고지한 보유기간과 반드시 같아야 한다.
 * 한쪽만 고치면 "적어둔 것"과 "실제로 하는 것"이 어긋난다.
 */
export const ACCOUNT_RETENTION_DAYS = 30;

/** 탈퇴한 시각을 주면, 실제 삭제가 일어나는 시각을 돌려준다. */
export function purgeAfter(deletedAt: Date): Date {
  const purgeAt = new Date(deletedAt);
  purgeAt.setDate(purgeAt.getDate() + ACCOUNT_RETENTION_DAYS);

  return purgeAt;
}

/** 지금 삭제 대상인 계정을 고를 때 쓰는 기준 시각. 이보다 전에 탈퇴했으면 지운다. */
export function purgeCutoff(now: Date = new Date()): Date {
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - ACCOUNT_RETENTION_DAYS);

  return cutoff;
}
