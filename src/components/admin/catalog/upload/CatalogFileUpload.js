"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { FiCheckCircle, FiFileText, FiXCircle } from "react-icons/fi";
import { uploadCatalogFileAction } from "@/actions/catalog";

const INITIAL_FORM_STATE = { ok: false, message: "" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type='submit'
      disabled={pending}
      className='inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300'
    >
      {pending ? "Mengupload..." : "Upload PDF"}
    </button>
  );
}

function Feedback({ state }) {
  if (!state?.message) return null;

  if (state.ok) {
    return (
      <p className='mt-3 inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700'>
        <FiCheckCircle className='h-4 w-4' />
        {state.message}
      </p>
    );
  }

  return (
    <p className='mt-3 inline-flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700'>
      <FiXCircle className='h-4 w-4' />
      {state.message}
    </p>
  );
}

function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function CatalogFileUpload({ files = [] }) {
  const [state, formAction, pending] = useActionState(
    uploadCatalogFileAction,
    INITIAL_FORM_STATE,
  );
  const formRef = useRef(null);
  const activeFile = files.find((entry) => entry.is_active) || null;

  useEffect(() => {
    if (state?.ok && !pending) {
      formRef.current?.reset();
    }
  }, [state, pending]);

  return (
    <section className='space-y-5'>
      <article className='rounded-xl border border-slate-200 bg-white p-4'>
        <h3 className='text-base font-semibold text-slate-900'>
          Upload File Katalog
        </h3>
        <p className='mt-1 text-sm text-slate-500'>
          Upload file katalog format PDF. Tidak ada validasi batas ukuran di
          aplikasi.
        </p>

        <form
          ref={formRef}
          action={formAction}
          className='mt-4 grid gap-3 md:max-w-xl'
        >
          <label className='block'>
            <span className='mb-1 block text-sm font-semibold text-slate-700'>
              Judul Katalog
            </span>
            <input
              type='text'
              name='title'
              placeholder='Contoh: Katalog Produk 2026'
              className='w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
            />
          </label>

          <label className='block'>
            <span className='mb-1 block text-sm font-semibold text-slate-700'>
              File Katalog (PDF)
            </span>
            <input
              type='file'
              name='catalogFile'
              accept='application/pdf,.pdf'
              required
              className='w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 file:mr-4 file:rounded-md file:border-0 file:bg-blue-600 file:px-3 file:py-2 file:text-white hover:file:bg-blue-700'
            />
          </label>

          <div className='pt-1'>
            <SubmitButton />
          </div>
        </form>

        <Feedback state={state} />
      </article>

      <article className='rounded-xl border border-slate-200 bg-white p-4'>
        <h3 className='text-base font-semibold text-slate-900'>File Aktif</h3>
        {activeFile ? (
          <div className='mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3'>
            <p className='inline-flex items-center gap-2 text-sm font-semibold text-slate-900'>
              <FiFileText className='h-4 w-4 text-blue-700' />
              {activeFile.title}
            </p>
            <p className='mt-1 text-xs text-slate-500'>
              Update: {formatDate(activeFile.updated_at)}
            </p>
            <a
              href={activeFile.file_url}
              target='_blank'
              rel='noreferrer'
              className='mt-3 inline-flex rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100'
            >
              Lihat PDF
            </a>
          </div>
        ) : (
          <div className='mt-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500'>
            Belum ada file katalog aktif.
          </div>
        )}
      </article>
    </section>
  );
}
