"use client";

import Image from "next/image";
import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { FiCheckCircle, FiEdit2, FiX, FiXCircle } from "react-icons/fi";
import { updateKitAction } from "@/actions/catalog";

const INITIAL_FORM_STATE = { ok: false, message: "" };

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

export default function KitUpdateModal({ kit }) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, pending] = useActionState(updateKitAction, INITIAL_FORM_STATE);
  const [heroPreview, setHeroPreview] = useState(null);
  const [newGalleryPreviews, setNewGalleryPreviews] = useState([]);

  function clearHeroPreview() {
    setHeroPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }

  function clearGalleryPreviews() {
    setNewGalleryPreviews((prev) => {
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
        className='inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100'
      >
        <FiEdit2 className='h-3.5 w-3.5' />
        Edit
      </button>

      {isOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4'>
          <div className='w-full max-w-5xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl'>
            <div className='flex items-center justify-between border-b border-slate-200 px-4 py-3'>
              <h3 className='text-base font-semibold text-slate-900'>Edit Kit: {kit.title}</h3>
              <button
                type='button'
                onClick={closeModal}
                className='rounded-md p-1.5 text-slate-600 transition hover:bg-slate-100'
              >
                <FiX className='h-4 w-4' />
              </button>
            </div>

            <form action={formAction} className='grid max-h-[80vh] gap-4 overflow-y-auto p-4 lg:grid-cols-2'>
              <input type='hidden' name='id' value={kit.id} />

              <div className='space-y-4'>
                <div>
                  <label className='mb-1 block text-sm font-semibold text-slate-700'>Nama Kit</label>
                  <input
                    type='text'
                    name='title'
                    required
                    defaultValue={kit.title}
                    className='w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                  />
                </div>

                <div>
                  <label className='mb-1 block text-sm font-semibold text-slate-700'>Slug</label>
                  <input
                    type='text'
                    name='slug'
                    required
                    defaultValue={kit.slug}
                    className='w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                  />
                </div>

                <div>
                  <label className='mb-1 block text-sm font-semibold text-slate-700'>Deskripsi</label>
                  <textarea
                    name='description'
                    required
                    rows={5}
                    defaultValue={kit.description}
                    className='w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                  />
                </div>
              </div>

              <div className='space-y-4'>
                <div>
                  <label className='mb-1 block text-sm font-semibold text-slate-700'>
                    Ganti Hero Image (opsional)
                  </label>
                  <input
                    type='file'
                    name='heroImage'
                    accept='image/*'
                    onChange={(event) => {
                      clearHeroPreview();
                      const file = event.target.files?.[0];
                      if (!file) return;
                      setHeroPreview(URL.createObjectURL(file));
                    }}
                    className='w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 file:mr-4 file:rounded-md file:border-0 file:bg-blue-600 file:px-3 file:py-2 file:text-white hover:file:bg-blue-700'
                  />
                  <div className='mt-2 overflow-hidden rounded-lg border border-slate-200 bg-slate-100'>
                    <div className='relative aspect-[16/8]'>
                      <Image
                        src={heroPreview || kit.hero_image_url}
                        alt={`${kit.title} hero`}
                        fill
                        sizes='(max-width: 1024px) 100vw, 40vw'
                        className='object-cover'
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className='mb-1 block text-sm font-semibold text-slate-700'>Tambah Gambar Galeri</label>
                  <input
                    type='file'
                    name='galleryImages'
                    multiple
                    accept='image/*'
                    onChange={(event) => {
                      clearGalleryPreviews();
                      const files = Array.from(event.target.files || []);
                      if (files.length === 0) return;
                      setNewGalleryPreviews(files.map((file) => URL.createObjectURL(file)));
                    }}
                    className='w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 file:mr-4 file:rounded-md file:border-0 file:bg-slate-700 file:px-3 file:py-2 file:text-white hover:file:bg-slate-800'
                  />
                </div>

                {newGalleryPreviews.length > 0 && (
                  <div className='rounded-lg border border-blue-200 bg-blue-50/40 p-3'>
                    <p className='text-sm font-semibold text-slate-800'>
                      Preview Gambar Baru ({newGalleryPreviews.length})
                    </p>
                    <div className='mt-2 grid max-h-56 grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3'>
                      {newGalleryPreviews.map((src, index) => (
                        <div
                          key={`${src}-${index}`}
                          className='relative aspect-[4/3] overflow-hidden rounded-md border border-slate-200 bg-slate-100'
                        >
                          <Image
                            src={src}
                            alt={`Preview gambar baru ${index + 1}`}
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
                  <input type='checkbox' name='isActive' defaultChecked={kit.is_active} className='h-4 w-4' />
                  Aktif tampil di website
                </label>

                {kit.gallery.length > 0 && (
                  <div className='rounded-lg border border-slate-200 bg-white p-3'>
                    <p className='text-sm font-semibold text-slate-800'>Galeri Saat Ini</p>
                    <p className='text-xs text-slate-500'>Centang gambar yang ingin dihapus saat update.</p>
                    <div className='mt-3 grid max-h-64 grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3'>
                      {kit.gallery.map((image) => (
                        <label key={image.id} className='space-y-1 rounded-md p-1 text-xs text-slate-600 hover:bg-slate-50'>
                          <div className='relative aspect-[4/3] overflow-hidden rounded-md border border-slate-200 bg-slate-100'>
                            <Image
                              src={image.image_url}
                              alt={`${kit.title} gallery ${image.id}`}
                              fill
                              sizes='(max-width: 640px) 50vw, 20vw'
                              className='object-cover'
                            />
                          </div>
                          <span className='inline-flex items-center gap-1'>
                            <input
                              type='checkbox'
                              name='removeGalleryIds'
                              value={image.id}
                              className='h-3.5 w-3.5'
                            />
                            Hapus
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

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
