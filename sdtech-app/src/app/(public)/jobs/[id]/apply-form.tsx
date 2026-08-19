"use client";

import { useActionState } from "react";
import { submitApplication } from "./actions";
import { Send } from "lucide-react";

const initialState = { success: false, error: "", whatsappUrl: "" };

export function ApplyForm({ jobId, jobTitle }: { jobId: string; jobTitle: string }) {
  const [state, formAction, pending] = useActionState(submitApplication, initialState);

  if (state.success) {
    return (
      <div className="text-center py-6">
        <p className="text-2xl mb-2">✅</p>
        <h3 className="font-semibold text-lg text-green-700">
          Application submitted!
        </h3>
        <p className="text-gray-500 mt-1">
          Now send your details via WhatsApp to complete the process.
        </p>
        {state.whatsappUrl && (
          <a
            href={state.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-accent inline-flex items-center gap-2 mt-4"
          >
            <Send size={16} /> Continue on WhatsApp
          </a>
        )}
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="jobId" value={jobId} />
      <input type="hidden" name="jobTitle" value={jobTitle} />

      {state.error && (
        <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{state.error}</p>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Full Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          placeholder="John Doe"
          className="input"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email Address *
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          placeholder="john@example.com"
          className="input"
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium mb-1">
          Phone Number *
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          required
          placeholder="+91 9876543210"
          className="input"
        />
      </div>

      <div>
        <label htmlFor="experience" className="block text-sm font-medium mb-1">
          Experience (years)
        </label>
        <input
          type="text"
          id="experience"
          name="experience"
          placeholder="e.g. 3 years"
          className="input"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="btn-accent w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {pending ? "Submitting..." : "Apply via WhatsApp →"}
      </button>
    </form>
  );
}
