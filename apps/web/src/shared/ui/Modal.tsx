"use client";

import type { ReactNode } from "react";

export function Modal({
  title,
  onClose,
  children,
  footer,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute inset-0 bg-content/25"
      />

      <div className="relative flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-xl">
        <header className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-[15px] font-bold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-content-dim transition-colors hover:text-content"
          >
            ✕
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>

        {footer && (
          <footer className="flex justify-end gap-2 border-t border-border px-5 py-4">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}

export function ModalButton({
  variant = "ghost",
  children,
  onClick,
  disabled,
}: {
  variant?: "ghost" | "primary";
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg px-4 py-2 text-sm font-semibold transition-opacity disabled:opacity-40 ${
        variant === "primary"
          ? "bg-accent text-on-accent hover:opacity-85"
          : "text-content-muted hover:text-content"
      }`}
    >
      {children}
    </button>
  );
}
