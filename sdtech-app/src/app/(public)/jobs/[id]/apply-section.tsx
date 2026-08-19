"use client";

import { useState } from "react";
import { ApplyForm } from "./apply-form";

export function ApplySection({ jobId, jobTitle }: { jobId: string; jobTitle: string }) {
  const [showForm, setShowForm] = useState(false);

  if (!showForm) {
    return (
      <div className="mt-4 sticky bottom-4">
        <button
          onClick={() => setShowForm(true)}
          className="btn-accent w-full py-3.5 text-base font-semibold shadow-lg shadow-accent/20"
        >
          Apply for this Job →
        </button>
      </div>
    );
  }

  return (
    <div className="card mt-4">
      <h2 className="font-semibold text-base text-primary mb-4">
        Apply for this position
      </h2>
      <ApplyForm jobId={jobId} jobTitle={jobTitle} />
    </div>
  );
}
