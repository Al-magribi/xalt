"use client";

import Link from "next/link";
import { useActionState } from "react";
import { motion } from "framer-motion";
import { FiArrowRight, FiLock, FiMail } from "react-icons/fi";
import { loginAction } from "@/actions/auth";

export default function Login({ initialMessage = "" }) {
  const [state, formAction, pending] = useActionState(loginAction, {
    ok: !initialMessage,
    message: initialMessage,
  });

  return (
    <main className='relative min-h-screen overflow-hidden bg-slate-950 px-4 py-8 text-slate-100 sm:px-6 lg:px-8'>
      <div className='pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl' />
      <div className='pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl' />

      <div className='mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center gap-8 lg:grid-cols-2'>
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className='hidden rounded-3xl border border-white/10 bg-white/5 p-10 backdrop-blur-sm lg:block'
        >
          <span className='inline-flex rounded-full border border-cyan-300/30 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-200'>
            Selamat datang kembali
          </span>
          <h1 className='mt-5 text-4xl font-semibold leading-tight'>
            Masuk dan lanjutkan aktivitas Anda di XALT.
          </h1>
          <p className='mt-4 max-w-md text-sm text-slate-300'>
            Kelola proyek, pantau aktivitas, dan tetap produktif dalam satu
            workspace yang rapi.
          </p>
          <div className='mt-8 grid gap-4 text-sm text-slate-200'>
            <div className='rounded-xl border border-white/10 bg-white/5 p-4'>
              Akses akun yang aman dengan autentikasi modern.
            </div>
            <div className='rounded-xl border border-white/10 bg-white/5 p-4'>
              Dashboard cepat dan pengalaman yang responsif.
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut", delay: 0.1 }}
          className='w-full rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8'
        >
          <div className='mb-8'>
            <h2 className='text-2xl font-semibold tracking-tight sm:text-3xl'>
              Masuk
            </h2>
            <p className='mt-2 text-sm text-slate-300'>
              Masukkan email dan kata sandi Anda.
            </p>
          </div>

          <form action={formAction} className='space-y-5'>
            <label className='block'>
              <span className='mb-2 block text-sm text-slate-200'>Email</span>
              <div className='flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition focus-within:border-cyan-300/60 focus-within:ring-2 focus-within:ring-cyan-300/30'>
                <FiMail className='text-cyan-300' aria-hidden='true' />
                <input
                  name='email'
                  type='email'
                  placeholder='nama@email.com'
                  autoComplete='email'
                  required
                  className='w-full bg-transparent text-sm outline-none placeholder:text-slate-400'
                />
              </div>
            </label>

            <label className='block'>
              <span className='mb-2 block text-sm text-slate-200'>
                Kata sandi
              </span>
              <div className='flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition focus-within:border-cyan-300/60 focus-within:ring-2 focus-within:ring-cyan-300/30'>
                <FiLock className='text-cyan-300' aria-hidden='true' />
                <input
                  name='password'
                  type='password'
                  placeholder='********'
                  autoComplete='current-password'
                  required
                  className='w-full bg-transparent text-sm outline-none placeholder:text-slate-400'
                />
              </div>
            </label>

            <div className='flex items-center justify-between gap-4 text-sm'>
              <label className='inline-flex items-center gap-2 text-slate-300'>
                <input
                  name='remember'
                  type='checkbox'
                  className='h-4 w-4 rounded border-white/20 bg-white/10'
                />
                Ingat saya
              </label>
              <Link
                href='/auth/forgot-password'
                className='text-cyan-300 transition hover:text-cyan-200'
              >
                Lupa kata sandi?
              </Link>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              whileHover={{ y: -1 }}
              type='submit'
              disabled={pending}
              className='inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-500 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70'
            >
              {pending ? "Memproses..." : "Masuk"}
              <FiArrowRight aria-hidden='true' />
            </motion.button>

            {state?.message ? (
              <p
                className={`text-sm ${state.ok ? "text-emerald-300" : "text-rose-300"}`}
                role='status'
                aria-live='polite'
              >
                {state.message}
              </p>
            ) : null}
          </form>

          {/* <p className="mt-6 text-center text-sm text-slate-300">
            Belum punya akun?{" "}
            <Link href="/auth/register" className="font-medium text-cyan-300 transition hover:text-cyan-200">
              Daftar sekarang
            </Link>
          </p> */}
        </motion.section>
      </div>
    </main>
  );
}
