"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { FiCheckCircle, FiPlusCircle, FiX, FiXCircle } from "react-icons/fi";
import { createKitAction } from "@/actions/catalog";
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
      {pending ? "Menyimpan..." : "Tambah Kit"}
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

export default function KitCreateModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createKitAction, INITIAL_FORM_STATE);
  const [heroPreview, setHeroPreview] = useState(null);
  const [galleryPreviews, setGalleryPreviews] = useState([]);

  function clearHeroPreview() {
    setHeroPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }

  function clearGalleryPreviews() {
    setGalleryPreviews((prev) => {
      prev.forEach((url) => URL.revokeObjectURL(url));
      return [];
    });
  }

  function closeModal() {
    clearHeroPreview();
    clearGalleryPreviews();
    setIsOpen(false);
  }

  useEffect(() => {
    if (state?.ok && !pending) {
      closeModal();
    }
  }, [state, pending]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => {
      clearHeroPreview();
      clearGalleryPreviews();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <button
        type='button'
        onClick={() => setIsOpen(true)}
        className='inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700'
      >
        <FiPlusCircle className='h-4 w-4' />
        Tambah Kit
      </button>

      {isOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4'>
          <div className='w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl'>
            <div className='flex items-center justify-between border-b border-slate-200 px-4 py-3'>
              <h3 className='text-base font-semibold text-slate-900'>Tambah Kit Baru</h3>
              <button
                type='button'
                onClick={closeModal}
                className='rounded-md p-1.5 text-slate-600 transition hover:bg-slate-100'
              >
                <FiX className='h-4 w-4' />
              </button>
            </div>

            <form action={formAction} className='grid max-h-[80vh] gap-4 overflow-y-auto p-4 lg:grid-cols-2'>
              <div className='space-y-4'>
                <div>
                  <label className='mb-1 block text-sm font-semibold text-slate-700'>Nama Kit</label>
                  <input
                    type='text'
                    name='title'
                    required
                    placeholder='Contoh: Corporate Welcome Kit'
                    className='w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                  />
                </div>

                <div>
                  <label className='mb-1 block text-sm font-semibold text-slate-700'>
                    Slug
                    <span className='ml-1 text-xs font-normal text-slate-500'>(opsional)</span>
                  </label>
                  <input
                    type='text'
                    name='slug'
                    placeholder='auto dari nama jika dikosongkan'
                    className='w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                  />
                </div>

                <div>
                  <label className='mb-1 block text-sm font-semibold text-slate-700'>Deskripsi</label>
                  <textarea
                    name='description'
                    required
                    rows={5}
                    placeholder='Tulis deskripsi singkat kit...'
                    className='w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                  />
                </div>
              </div>

              <div className='space-y-4'>
                <div>
                  <label className='mb-1 block text-sm font-semibold text-slate-700'>Hero Image</label>
                  <p className='mb-2 text-xs text-slate-500'>
                    Rasio 2:1 (contoh 1920×960 px). Gambar akan ditampilkan utuh tanpa terpotong.
                  </p>
                  <input
                    type='file'
                    name='heroImage'
                    required
                    accept='image/*'
                    onChange={(event) => {
                      clearHeroPreview();
                      const file = event.target.files?.[0];
                      if (!file) return;
                      setHeroPreview(URL.createObjectURL(file));
                    }}
                    className='w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 file:mr-4 file:rounded-md file:border-0 file:bg-blue-600 file:px-3 file:py-2 file:text-white hover:file:bg-blue-700'
                  />
                  {heroPreview && (
                    <div className='mt-2 overflow-hidden rounded-lg border border-slate-200 bg-slate-100'>
                      <div className='relative aspect-[16/8]'>
                        <AppImage src={heroPreview} alt='Hero preview' fill className='object-contain' sizes='(max-width: 1024px) 100vw, 40vw' />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className='mb-1 block text-sm font-semibold text-slate-700'>
                    Galeri Kit (bisa banyak)
                  </label>
                  <p className='mb-2 text-xs text-slate-500'>
                    Rasio 4:3 (contoh 1200×900 px).
                  </p>
                  <input
                    type='file'
                    name='galleryImages'
                    multiple
                    accept='image/*'
                    onChange={(event) => {
                      clearGalleryPreviews();
                      const files = Array.from(event.target.files || []);
                      if (files.length === 0) return;
                      setGalleryPreviews(files.map((file) => URL.createObjectURL(file)));
                    }}
                    className='w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 file:mr-4 file:rounded-md file:border-0 file:bg-slate-700 file:px-3 file:py-2 file:text-white hover:file:bg-slate-800'
                  />
                </div>

                {galleryPreviews.length > 0 && (
                  <div className='rounded-lg border border-slate-200 bg-white p-3'>
                    <p className='text-sm font-semibold text-slate-800'>
                      Preview Galeri Baru ({galleryPreviews.length})
                    </p>
                    <div className='mt-2 grid max-h-56 grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3'>
                      {galleryPreviews.map((src, index) => (
                        <div
                          key={`${src}-${index}`}
                          className='relative aspect-[4/3] overflow-hidden rounded-md border border-slate-200 bg-slate-100'
                        >
                          <AppImage
                            src={src}
                            alt={`Preview gallery ${index + 1}`}
                            fill
                            sizes='(max-width: 640px) 50vw, 20vw'
                            className='object-cover'
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
        </div>
      )}
    </>
  );
}
