"use client";

import React, { useEffect } from "react";

export function MessageModal({
  isOpen,
  title,
  children,
  onClose,
}: {
  isOpen: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      <button
        aria-label="Close modal"
        className="absolute inset-0 bg-black/40"
        style={{ backdropFilter: "blur(2px)" }}
        onClick={onClose}
      />
      <div className="relative mx-4 w-full max-w-lg rounded-2xl border border-white/15 bg-zinc-900/95 p-6 text-white shadow-2xl">
        <div className="mb-3 flex items-start justify-between gap-4">
          <h2 className="text-xl font-bold tracking-tight">{title}</h2>
          <button
            className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold transition hover:bg-purple-700"
            onClick={onClose}
          >
            X
          </button>
        </div>
        <div className="text-sm leading-relaxed text-zinc-200">{children}</div>
      </div>
    </div>
  );
}
