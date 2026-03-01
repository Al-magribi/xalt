"use client";

import { useActionState } from "react";
import { requestPasswordResetAction } from "@/actions/auth";

export default function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(requestPasswordResetAction, {
    ok: true,
    message: "",
  });

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <label className="block">
        <span className="mb-2 block text-sm text-slate-200">Email</span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-cyan-300/60"
          placeholder="nama@email.com"
        />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-500 px-4 py-3 text-sm font-semibold text-slate-900 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {pending ? "Memproses..." : "Kirim Link Reset"}
      </button>

      {state?.message ? (
        <p className={`text-sm ${state.ok ? "text-emerald-300" : "text-rose-300"}`}>{state.message}</p>
      ) : null}
    </form>
  );
}
