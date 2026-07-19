"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { FiCheckCircle, FiX, FiXCircle } from "react-icons/fi";
import { updateMerchandiseCategoryAction } from "@/actions/catalog";
import AppImage from "@/components/ui/AppImage";

const INITIAL_FORM_STATE = { ok: false, message: "" };
const FALLBACK_IMAGE_SRC = "/placeholder-image.svg";

function getSafeImageSrc(value) {
  if (typeof value === "string" && value.trim()) return value;
  return FALLBACK_IMAGE_SRC;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type='submit'
      disabled={pending}
      className='inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300'
    >
      {pending ? "Menyimpan..." : "Simpan Perubahan"}
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

export default function CategoryUpdateModal({ item, onClose }) {
  const [state, formAction, pending] = useActionState(
    updateMerchandiseCategoryAction,
    INITIAL_FORM_STATE,
  );
  const [imagePreview, setImagePreview] = useState(null);

  function clearImagePreview() {
    setImagePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }

  useEffect(() => {
    if (state?.ok && !pending) {
      onClose?.();
    }
  }, [state, pending, onClose]);

  useEffect(() => {
    return () => clearImagePreview();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4'>
      <div className='w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl'>
        <div className='flex items-center justify-between border-b border-slate-200 px-4 py-3'>
          <h3 className='text-base font-semibold text-slate-900'>Edit Kategori</h3>
          <button
            type='button'
            onClick={onClose}
            className='rounded-md p-1.5 text-slate-600 transition hover:bg-slate-100'
          >
            <FiX className='h-4 w-4' />
          </button>
        </div>

        <form action={formAction} className='grid gap-4 p-4 sm:grid-cols-2'>
          <input type='hidden' name='id' value={item.id} />
          <div className='space-y-4'>
            <div>
              <label className='mb-1 block text-sm font-semibold text-slate-700'>
                Nama Kategori
              </label>
              <input
                type='text'
                name='title'
                defaultValue={item.title}
                required
                className='w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
              />
            </div>
            <div>
              <label className='mb-1 block text-sm font-semibold text-slate-700'>
                Slug
              </label>
              <input
                type='text'
                name='slug'
                defaultValue={item.slug}
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
                defaultValue={item.sort_order}
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
                defaultValue={item.description}
                className='w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
              />
            </div>
            <label className='inline-flex items-center gap-2 text-sm font-medium text-slate-700'>
              <input
                type='checkbox'
                name='isActive'
                defaultChecked={item.is_active}
              />
              Aktif
            </label>
          </div>

          <div className='space-y-4'>
            <div>
              <label className='mb-1 block text-sm font-semibold text-slate-700'>
                Ganti Gambar (opsional)
              </label>
              <input
                type='file'
                name='image'
                accept='image/*'
                onChange={(event) => {
                  clearImagePreview();
                  const file = event.target.files?.[0];
                  if (file) setImagePreview(URL.createObjectURL(file));
                }}
                className='block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100'
              />
            </div>
            <div className='relative aspect-[4/5] overflow-hidden rounded-xl border border-slate-200 bg-white'>
              <AppImage
                src={imagePreview || getSafeImageSrc(item.image_url)}
                alt={item.title}
                fill
                className='object-contain object-center p-3'
                sizes='400px'
              />
            </div>
            <SubmitButton />
            <Feedback state={state} />
          </div>
        </form>
      </div>
    </div>
  );
}
