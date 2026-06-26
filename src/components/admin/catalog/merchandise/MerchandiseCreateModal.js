"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { FiCheckCircle, FiXCircle } from "react-icons/fi";
import { createMerchandiseAction } from "@/actions/catalog";
import AppImage from "@/components/ui/AppImage";

const INITIAL_FORM_STATE = { ok: false, message: "" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type='submit'
      disabled={pending}
      className='inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300'
    >
      {pending ? "Menyimpan..." : "Tambah Merchandise"}
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

export default function MerchandiseCreateModal() {
  const [state, formAction, pending] = useActionState(createMerchandiseAction, INITIAL_FORM_STATE);
  const [imagePreviews, setImagePreviews] = useState([]);

  function clearImagePreviews() {
    setImagePreviews((prev) => {
      prev.forEach((url) => URL.revokeObjectURL(url));
      return [];
    });
  }

  useEffect(() => {
    if (state?.ok && !pending) {
      clearImagePreviews();
    }
  }, [state, pending]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => {
      clearImagePreviews();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className='rounded-xl border border-slate-200 bg-white p-4'>
      <h4 className='text-sm font-semibold text-slate-900'>Tambah Merchandise</h4>
      <form action={formAction} className='mt-3 grid gap-4 lg:grid-cols-2'>
              <div className='space-y-4'>
                <div>
                  <label className='mb-1 block text-sm font-semibold text-slate-700'>Nama Merchandise</label>
                  <input
                    type='text'
                    name='title'
                    required
                    className='w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                  />
                </div>

                <div>
                  <label className='mb-1 block text-sm font-semibold text-slate-700'>Slug (opsional)</label>
                  <input
                    type='text'
                    name='slug'
                    className='w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                  />
                </div>

                <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
                  <div className='sm:col-span-2'>
                    <label className='mb-1 block text-sm font-semibold text-slate-700'>Harga</label>
                    <input
                      type='number'
                      name='priceAmount'
                      min='0'
                      step='0.01'
                      required
                      className='w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                    />
                  </div>
                  <div>
                    <label className='mb-1 block text-sm font-semibold text-slate-700'>Currency</label>
                    <input
                      type='text'
                      name='currency'
                      defaultValue='IDR'
                      maxLength={3}
                      required
                      className='w-full rounded-lg border border-slate-300 px-3 py-2 text-sm uppercase outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                    />
                  </div>
                </div>

                <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                  <div>
                    <label className='mb-1 block text-sm font-semibold text-slate-700'>Minimum Order</label>
                    <input
                      type='number'
                      name='minOrder'
                      min='1'
                      step='1'
                      defaultValue='1'
                      required
                      className='w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                    />
                  </div>
                </div>

                <div>
                  <label className='mb-1 block text-sm font-semibold text-slate-700'>Detail Produk</label>
                  <textarea
                    name='detail'
                    rows={5}
                    required
                    className='w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                  />
                </div>

                <div>
                  <label className='mb-1 block text-sm font-semibold text-slate-700'>Pilihan Size</label>
                  <textarea
                    name='sizeOptions'
                    rows={3}
                    placeholder='Contoh: S, M, L, XL atau satu baris per size'
                    className='w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                  />
                </div>

                <div>
                  <label className='mb-1 block text-sm font-semibold text-slate-700'>Pilihan Bahan</label>
                  <textarea
                    name='materialOptions'
                    rows={3}
                    placeholder='Contoh: Cotton Combed 24s, Polyester, Drill'
                    className='w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                  />
                </div>
              </div>

              <div className='space-y-4'>
                <div>
                  <label className='mb-1 block text-sm font-semibold text-slate-700'>Gambar Produk</label>
                  <p className='mb-2 text-xs text-slate-500'>
                    Gambar utama rasio 2:1 (contoh 1920×960 px). Galeri tambahan rasio 4:3
                    (contoh 1200×900 px). Gambar pertama menjadi gambar utama.
                  </p>
                  <input
                    type='file'
                    name='images'
                    required
                    multiple
                    accept='image/*'
                    onChange={(event) => {
                      clearImagePreviews();
                      const files = Array.from(event.target.files || []);
                      if (files.length === 0) return;
                      setImagePreviews(files.map((file) => URL.createObjectURL(file)));
                    }}
                    className='w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 file:mr-4 file:rounded-md file:border-0 file:bg-blue-600 file:px-3 file:py-2 file:text-white hover:file:bg-blue-700'
                  />
                  <p className='mt-1 text-xs text-slate-500'>Gambar pertama akan dijadikan gambar utama.</p>
                </div>

                {imagePreviews.length > 0 && (
                  <div className='overflow-hidden rounded-lg border border-slate-200 bg-slate-100'>
                    <p className='border-b border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600'>
                      Preview ({imagePreviews.length})
                    </p>
                    <div className='grid max-h-72 grid-cols-2 gap-2 overflow-y-auto p-2 sm:grid-cols-3'>
                      {imagePreviews.map((src, index) => (
                        <div
                          key={`${src}-${index}`}
                          className='relative aspect-[2/1] overflow-hidden rounded-md border border-slate-200 bg-slate-50'
                        >
                          <AppImage
                            src={src}
                            alt={`Preview gambar merchandise ${index + 1}`}
                            fill
                            sizes='(max-width: 1024px) 40vw, 15vw'
                            className='object-contain'
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <label className='inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700'>
                  <input type='checkbox' name='isActive' defaultChecked className='h-4 w-4' />
                  Aktif tampil di website
                </label>

                <SubmitButton />
                <Feedback state={state} />
              </div>
      </form>
    </div>
  );
}
