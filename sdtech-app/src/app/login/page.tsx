"use client";

import { useActionState } from "react";
import { loginAdmin } from "./actions";

const initialState = { error: "" };

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(loginAdmin, initialState);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-4">
      <div className="w-full max-w-sm">
        <div className="card text-center">
          <div className="text-3xl mb-2">🔐</div>
          <h1 className="text-lg font-bold text-primary">Admin Access</h1>
          <p className="text-xs text-gray-500 mt-1 mb-5">
            Enter your admin token to continue.
          </p>

          {state.error && (
            <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg mb-4">
              {state.error}
            </p>
          )}

          <form action={formAction} className="space-y-3">
            <input
              type="password"
              name="token"
              required
              placeholder="Admin token"
              className="input text-center"
              autoFocus
              autoComplete="current-password"
            />
            <button
              type="submit"
              disabled={pending}
              className="btn-primary w-full py-3 disabled:opacity-50"
            >
              {pending ? "Verifying..." : "Sign In →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
