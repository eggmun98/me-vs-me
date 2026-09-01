/**
 * 약관·방침 문서의 뼈대.
 *
 * 문서를 마크다운과 화면 두 벌로 두지 않는다. 두 벌이 되면 반드시 한쪽만 고쳐지고,
 * 실제와 다른 고지는 고지를 하지 않은 것보다 나쁘다. 여기가 유일한 원본이다.
 *
 * 블록을 배열로 둔 이유는 순서 때문이다. 법 문서는 "표를 설명하는 문단 → 표 →
 * 표에 딸린 단서" 처럼 같은 종류가 앞뒤로 나뉘어 나오는 일이 잦다.
 * 문단·표를 각각 한 칸씩만 둔 구조로는 그 순서를 적을 수 없다.
 */
export type LegalBlock =
  | { kind: "text"; body: string[] }
  /** 번호가 붙는 조항. 순서 자체가 인용의 근거가 된다 — "제9조 제2항". */
  | { kind: "clauses"; items: string[] }
  | { kind: "bullets"; items: string[] }
  | { kind: "table"; head: string[]; rows: string[][] };

export type LegalSection = {
  heading: string;
  blocks: LegalBlock[];
};

export type LegalDocument = {
  title: string;
  /** 이 문서가 효력을 갖는 날. 개정하면 반드시 함께 올린다. */
  effectiveFrom: string;
  intro?: string[];
  sections: LegalSection[];
};
