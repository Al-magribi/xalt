import Link from "next/link";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-white/10 bg-slate-900/70 p-6">
        <h1 className="text-2xl font-semibold">Lupa Kata Sandi</h1>
        <p className="mt-2 text-sm text-slate-300">
          Masukkan email akun Anda. Jika terdaftar, kami akan kirim link reset password.
        </p>

        <ForgotPasswordForm />

        <Link href="/auth" className="mt-5 inline-block text-sm text-cyan-300 hover:text-cyan-200">
          Kembali ke halaman login
        </Link>
      </div>
    </main>
  );
}
