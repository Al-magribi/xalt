"use client";

import { useActionState } from "react";
import { resetPasswordAction } from "@/actions/auth";

export default function ResetPasswordForm({ token }) {
  const [state, formAction, pending] = useActionState(resetPasswordAction, {
    ok: true,
    message: "",
  });

  if (!token) {
    return <p className="mt-6 text-sm text-rose-300">Token reset tidak ditemukan.</p>;
  }

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <input type="hidden" name="token" value={token} />

      <label className="block">
        <span className="mb-2 block text-sm text-slate-200">Password Baru</span>
        <input
          type="password"
          name="password"
          required
          autoComplete="new-password"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-cyan-300/60"
          placeholder="Minimal 8 karakter"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm text-slate-200">Konfirmasi Password</span>
        <input
          type="password"
          name="confirmPassword"
          required
          autoComplete="new-password"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-cyan-300/60"
          placeholder="Ulangi password baru"
        />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-500 px-4 py-3 text-sm font-semibold text-slate-900 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {pending ? "Memproses..." : "Reset Password"}
      </button>

      {state?.message ? (
        <p className={`text-sm ${state.ok ? "text-emerald-300" : "text-rose-300"}`}>{state.message}</p>
      ) : null}
    </form>
  );
}
