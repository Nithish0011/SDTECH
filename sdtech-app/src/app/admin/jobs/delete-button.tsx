"use client";

import { Trash2 } from "lucide-react";
import { useTransition } from "react";

export function DeleteJobButton({ deleteAction }: { deleteAction: () => Promise<void> }) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm("Delete this job and all its applications?")) return;
    startTransition(async () => {
      await deleteAction();
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className="btn-danger text-xs px-3 py-1.5 flex items-center gap-1 disabled:opacity-50"
    >
      <Trash2 size={14} /> {pending ? "..." : "Delete"}
    </button>
  );
}
