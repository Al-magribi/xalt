import Link from "next/link";
import { activateAccountByToken } from "@/actions/auth";
import { redirect } from "next/navigation";

export default async function ActivatePage({ searchParams }) {
  const params = await searchParams;
  const token = typeof params?.token === "string" ? params.token : "";

  const result = await activateAccountByToken(token);
  if (result.ok) {
    redirect("/auth?activated=1");
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-white/10 bg-slate-900/70 p-6">
        <h1 className="text-2xl font-semibold">Aktivasi Gagal</h1>
        <p className="mt-3 text-sm text-rose-300">{result.message}</p>
        <Link href="/auth/register" className="mt-5 inline-block text-sm text-cyan-300 hover:text-cyan-200">
          Kembali ke halaman daftar
        </Link>
      </div>
    </main>
  );
}
