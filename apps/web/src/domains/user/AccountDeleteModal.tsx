"use client";

import { ACCOUNT_RETENTION_DAYS } from "@nadaena/core";
import { useState } from "react";
import { Modal, ModalButton } from "@/shared/ui/Modal";

/** 손이 미끄러져 지워지는 일이 없도록, 이 글자를 그대로 적어야 버튼이 열린다. */
const CONFIRM_WORD = "탈퇴";

/**
 * 회원탈퇴 확인.
 *
 * 무엇이 사라지고 언제 사라지는지, 되돌릴 방법이 있는지를 누르기 전에 다 보여준다.
 * 되돌릴 수 없는 일에서 사용자가 놀라는 건 대부분 설명이 뒤에 왔기 때문이다.
 */
export function AccountDeleteModal({
  isPending,
  error,
  onConfirm,
  onClose,
}: {
  isPending: boolean;
  error: string | null;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const [typed, setTyped] = useState("");
  const canDelete = typed.trim() === CONFIRM_WORD && !isPending;

  return (
    <Modal
      title="회원 탈퇴"
      onClose={onClose}
      footer={
        <>
          <ModalButton onClick={onClose}>취소</ModalButton>
          <ModalButton variant="primary" onClick={onConfirm} disabled={!canDelete}>
            {isPending ? "처리 중…" : "탈퇴하기"}
          </ModalButton>
        </>
      }
    >
      <div className="flex flex-col gap-4 text-sm leading-relaxed">
        <p>탈퇴하면 지금까지 쌓은 기록을 더 이상 볼 수 없습니다.</p>

        <ul className="flex flex-col gap-1.5 rounded-lg border border-border bg-surface-hover px-3.5 py-3 text-content-muted">
          <li>· 미션과 모든 승패 기록</li>
          <li>· 연승 기록과 통계</li>
          <li>· 프로필과 소셜 로그인 연결</li>
        </ul>

        <p className="text-content-muted">
          데이터는 <span className="font-semibold text-content">{ACCOUNT_RETENTION_DAYS}일</span>{" "}
          동안 보관한 뒤 완전히 삭제됩니다. 그 안에 같은 계정으로 다시 로그인하면 기록이 그대로
          되살아납니다.
        </p>

        <label className="flex flex-col gap-2">
          <span className="text-content-muted">
            계속하려면 <span className="font-semibold text-content">{CONFIRM_WORD}</span> 를
            입력하세요.
          </span>
          <input
            value={typed}
            onChange={(event) => setTyped(event.target.value)}
            placeholder={CONFIRM_WORD}
            className="rounded-lg border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-content-dim"
          />
        </label>

        {error && <p className="text-lose">{error}</p>}
      </div>
    </Modal>
  );
}
