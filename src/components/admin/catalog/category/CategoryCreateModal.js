"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { FiCheckCircle, FiPlusCircle, FiX, FiXCircle } from "react-icons/fi";
import { createMerchandiseCategoryAction } from "@/actions/catalog";
import AppImage from "@/components/ui/AppImage";

const INITIAL_FORM_STATE = { ok: false, message: "" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type='submit'
      disabled={pending}
      className='inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300'
    >
      {pending ? "Menyimpan..." : "Tambah Kategori"}
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

export default function CategoryCreateModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    createMerchandiseCategoryAction,
    INITIAL_FORM_STATE,
  );
  const [imagePreview, setImagePreview] = useState(null);

  function clearImagePreview() {
    setImagePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }

  function closeModal() {
    clearImagePreview();
    setIsOpen(false);
  }

  useEffect(() => {
    if (state?.ok && !pending) {
      closeModal();
    }
  }, [state, pending]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => clearImagePreview();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <button
        type='button'
        onClick={() => setIsOpen(true)}
        className='inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700'
      >
        <FiPlusCircle className='h-4 w-4' />
        Tambah Kategori
      </button>

      {isOpen ? (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4'>
          <div className='w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl'>
            <div className='flex items-center justify-between border-b border-slate-200 px-4 py-3'>
              <h3 className='text-base font-semibold text-slate-900'>
                Tambah Kategori
              </h3>
              <button
                type='button'
                onClick={closeModal}
                className='rounded-md p-1.5 text-slate-600 transition hover:bg-slate-100'
              >
                <FiX className='h-4 w-4' />
              </button>
            </div>

            <form action={formAction} className='grid gap-4 p-4 sm:grid-cols-2'>
              <div className='space-y-4'>
                <div>
                  <label className='mb-1 block text-sm font-semibold text-slate-700'>
                    Nama Kategori
                  </label>
                  <input
                    type='text'
                    name='title'
                    required
                    className='w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                  />
                </div>
                <div>
                  <label className='mb-1 block text-sm font-semibold text-slate-700'>
                    Slug (opsional)
                  </label>
                  <input
                    type='text'
                    name='slug'
                    className='w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                  />
                </div>
                <div>
                  <label className='mb-1 block text-sm font-semibold text-slate-700'>
                    Urutan
                  </label>
                  <input
                    type='number'
                    name='sortOrder'
                    defaultValue={0}
                    className='w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                  />
                </div>
                <div>
                  <label className='mb-1 block text-sm font-semibold text-slate-700'>
                    Deskripsi
                  </label>
                  <textarea
                    name='description'
                    rows={4}
                    className='w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                  />
                </div>
                <label className='inline-flex items-center gap-2 text-sm font-medium text-slate-700'>
                  <input type='checkbox' name='isActive' defaultChecked />
                  Aktif
                </label>
              </div>

              <div className='space-y-4'>
                <div>
                  <label className='mb-1 block text-sm font-semibold text-slate-700'>
                    Gambar Cover
                  </label>
                  <input
                    type='file'
                    name='image'
                    accept='image/*'
                    required
                    onChange={(event) => {
                      clearImagePreview();
                      const file = event.target.files?.[0];
                      if (file) setImagePreview(URL.createObjectURL(file));
                    }}
                    className='block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100'
                  />
                </div>
                {imagePreview ? (
                  <div className='relative aspect-[4/5] overflow-hidden rounded-xl border border-slate-200 bg-white'>
                    <AppImage
                      src={imagePreview}
                      alt='Preview kategori'
                      fill
                      className='object-contain object-center p-3'
                      sizes='400px'
                    />
                  </div>
                ) : null}
                <SubmitButton />
                <Feedback state={state} />
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
