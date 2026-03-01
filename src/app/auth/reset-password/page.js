import Link from "next/link";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

export default async function ResetPasswordPage({ searchParams }) {
  const params = await searchParams;
  const token = typeof params?.token === "string" ? params.token : "";

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-white/10 bg-slate-900/70 p-6">
        <h1 className="text-2xl font-semibold">Reset Kata Sandi</h1>
        <p className="mt-2 text-sm text-slate-300">
          Masukkan password baru Anda. Token reset hanya berlaku satu kali.
        </p>

        <ResetPasswordForm token={token} />

        <Link href="/auth" className="mt-5 inline-block text-sm text-cyan-300 hover:text-cyan-200">
          Kembali ke halaman login
        </Link>
      </div>
    </main>
  );
}
