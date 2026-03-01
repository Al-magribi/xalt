"use client";

import { useState, useTransition } from "react";
import { requestCatalogDownloadAction } from "@/actions/catalog";

const INITIAL_FORM = {
  name: "",
  email: "",
  whatsapp: "",
};

export default function CatalogDownloadForm({ hasActiveCatalog = false, catalogTitle = "" }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [feedback, setFeedback] = useState({ ok: false, message: "" });
  const [isSubmitting, startSubmitting] = useTransition();

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = (event) => {
    event.preventDefault();
    setFeedback({ ok: false, message: "" });

    startSubmitting(async () => {
      const response = await requestCatalogDownloadAction({
        name: form.name,
        email: form.email,
        whatsapp: form.whatsapp,
      });

      if (!response?.ok) {
        setFeedback({
          ok: false,
          message: response?.message || "Gagal mengirim katalog.",
        });
        return;
      }

      setFeedback({
        ok: true,
        message: response.message || "Katalog berhasil dikirim ke email Anda.",
      });
      setForm(INITIAL_FORM);
    });
  };

  return (
    <div className='grid gap-6 md:grid-cols-2'>
      <article className='rounded-2xl border border-slate-200 bg-white p-5 sm:p-6'>
        <h2 className='text-2xl font-semibold text-slate-900'>Download Katalog</h2>
        <p className='mt-2 text-sm text-slate-600'>
          Isi data berikut. File katalog akan dikirim ke email Anda.
        </p>
        <p className='mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600'>
          File aktif: <span className='font-semibold text-slate-900'>{catalogTitle || "-"}</span>
        </p>

        <form onSubmit={onSubmit} className='mt-5 space-y-3'>
          <label className='block space-y-1 text-sm'>
            <span className='font-medium text-slate-700'>Nama Lengkap</span>
            <input
              type='text'
              name='name'
              value={form.name}
              onChange={onChange}
              required
              disabled={!hasActiveCatalog || isSubmitting}
              className='w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-blue-200 focus:border-blue-500 focus:ring disabled:cursor-not-allowed disabled:bg-slate-100'
              placeholder='Nama lengkap'
            />
          </label>

          <label className='block space-y-1 text-sm'>
            <span className='font-medium text-slate-700'>Email</span>
            <input
              type='email'
              name='email'
              value={form.email}
              onChange={onChange}
              required
              disabled={!hasActiveCatalog || isSubmitting}
              className='w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-blue-200 focus:border-blue-500 focus:ring disabled:cursor-not-allowed disabled:bg-slate-100'
              placeholder='nama@email.com'
            />
          </label>

          <label className='block space-y-1 text-sm'>
            <span className='font-medium text-slate-700'>No WhatsApp</span>
            <input
              type='text'
              name='whatsapp'
              value={form.whatsapp}
              onChange={onChange}
              required
              disabled={!hasActiveCatalog || isSubmitting}
              className='w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-blue-200 focus:border-blue-500 focus:ring disabled:cursor-not-allowed disabled:bg-slate-100'
              placeholder='628xxxxxxxxxx'
            />
          </label>

          {feedback.message ? (
            <p className={`text-sm ${feedback.ok ? "text-emerald-700" : "text-rose-700"}`}>
              {feedback.message}
            </p>
          ) : null}

          <button
            type='submit'
            disabled={!hasActiveCatalog || isSubmitting}
            className='inline-flex w-full items-center justify-center rounded-xl bg-blue-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-400'
          >
            {isSubmitting ? "Mengirim..." : "Download Katalog"}
          </button>
        </form>
      </article>

      <article className='rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6'>
        <h3 className='text-lg font-semibold text-slate-900'>Info</h3>
        <ul className='mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600'>
          <li>Pastikan email yang diisi aktif.</li>
          <li>File katalog akan dikirim sebagai lampiran PDF ke email Anda.</li>
          <li>Cek folder spam/promosi bila email belum masuk.</li>
        </ul>

        {!hasActiveCatalog ? (
          <p className='mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700'>
            Katalog belum tersedia. Silakan hubungi admin.
          </p>
        ) : null}
      </article>
    </div>
  );
}
