"use client";

import { Modal, ModalButton } from "@/shared/ui/Modal";
import type { Mission } from "./missionTypes";

/**
 * 6.5 스냅샷 규칙을 반드시 설명해야 한다.
 * 지웠는데 오늘 화면에 그대로 남아 있으면 버그로 보인다. (05-screens.md S9)
 */
export function MissionDeleteModal({
  mission,
  appliedFrom,
  onConfirm,
  onClose,
}: {
  mission: Mission;
  appliedFrom: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal
      title="미션 삭제"
      onClose={onClose}
      footer={
        <>
          <ModalButton onClick={onClose}>취소</ModalButton>
          <ModalButton variant="primary" onClick={onConfirm}>
            삭제
          </ModalButton>
        </>
      }
    >
      <div className="flex flex-col gap-4 text-sm leading-relaxed">
        <p>
          <span className="font-semibold">{mission.name}</span> 미션을 삭제할까요?
        </p>
        <div className="rounded-lg border border-border bg-surface-hover px-3.5 py-3 text-content-muted">
          <p>
            오늘 승부에는 이미 포함되어 있어{" "}
            <span className="font-semibold text-content">{appliedFrom}부터</span> 적용됩니다.
          </p>
          <p className="mt-1.5">지난 기록은 그대로 남습니다.</p>
        </div>
      </div>
    </Modal>
  );
}
