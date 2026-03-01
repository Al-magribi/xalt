"use client";

import Image from "next/image";
import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { FiCheckCircle, FiChevronDown, FiChevronUp, FiXCircle } from "react-icons/fi";
import { updateMerchandiseAction } from "@/actions/catalog";

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

export default function MerchandiseUpdateModal({
  item,
  forceOpen = false,
  showToggle = true,
}) {
  const [isOpen, setIsOpen] = useState(forceOpen);
  const [state, formAction, pending] = useActionState(
    updateMerchandiseAction,
    INITIAL_FORM_STATE,
  );
  const [primaryImagePreview, setPrimaryImagePreview] = useState(null);
  const [newGalleryPreviews, setNewGalleryPreviews] = useState([]);

  function clearPrimaryImagePreview() {
    setPrimaryImagePreview((prev) => {
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

  function closeEditor() {
    clearPrimaryImagePreview();
    clearGalleryPreviews();
    if (showToggle) {
      setIsOpen(false);
    }
  }

  useEffect(() => {
    if (state?.ok && !pending) {
      closeEditor();
    }
  }, [state, pending]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => {
      clearPrimaryImagePreview();
      clearGalleryPreviews();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className='rounded-lg border border-slate-200 bg-white'>
      {showToggle ? (
        <button
          type='button'
          onClick={() => setIsOpen((prev) => !prev)}
          className='inline-flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-semibold text-blue-700 transition hover:bg-blue-50'
        >
          <span>Edit Merchandise</span>
          {isOpen ? <FiChevronUp className='h-4 w-4' /> : <FiChevronDown className='h-4 w-4' />}
        </button>
      ) : null}

      {isOpen && (
        <form
          action={formAction}
          className={`grid gap-4 p-3 lg:grid-cols-2 ${
            showToggle ? "border-t border-slate-200" : ""
          }`}
        >
              <input type='hidden' name='id' value={item.id} />

              <div className='space-y-4'>
                <div>
                  <label className='mb-1 block text-sm font-semibold text-slate-700'>
                    Nama Merchandise
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
                    required
                    className='w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                  />
                </div>

                <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
                  <div className='sm:col-span-2'>
                    <label className='mb-1 block text-sm font-semibold text-slate-700'>
                      Harga
                    </label>
                    <input
                      type='number'
                      name='priceAmount'
                      min='0'
                      step='0.01'
                      defaultValue={item.price_amount}
                      required
                      className='w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                    />
                  </div>
                  <div>
                    <label className='mb-1 block text-sm font-semibold text-slate-700'>
                      Currency
                    </label>
                    <input
                      type='text'
                      name='currency'
                      defaultValue={item.currency}
                      maxLength={3}
                      required
                      className='w-full rounded-lg border border-slate-300 px-3 py-2 text-sm uppercase outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                    />
                  </div>
                </div>

                <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                  <div>
                    <label className='mb-1 block text-sm font-semibold text-slate-700'>
                      Minimum Order
                    </label>
                    <input
                      type='number'
                      name='minOrder'
                      min='1'
                      step='1'
                      defaultValue={item.min_order}
                      required
                      className='w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                    />
                  </div>
                </div>

                <div>
                  <label className='mb-1 block text-sm font-semibold text-slate-700'>
                    Detail Produk
                  </label>
                  <textarea
                    name='detail'
                    rows={5}
                    defaultValue={item.detail}
                    required
                    className='w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                  />
                </div>

                <div>
                  <label className='mb-1 block text-sm font-semibold text-slate-700'>
                    Pilihan Size
                  </label>
                  <textarea
                    name='sizeOptions'
                    rows={3}
                    defaultValue={(item.size_options || []).join(", ")}
                    placeholder='Contoh: S, M, L, XL atau satu baris per size'
                    className='w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                  />
                </div>

                <div>
                  <label className='mb-1 block text-sm font-semibold text-slate-700'>
                    Pilihan Bahan
                  </label>
                  <textarea
                    name='materialOptions'
                    rows={3}
                    defaultValue={(item.material_options || []).join(", ")}
                    placeholder='Contoh: Cotton Combed 24s, Polyester, Drill'
                    className='w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                  />
                </div>
              </div>

              <div className='space-y-4'>
                <div>
                  <label className='mb-1 block text-sm font-semibold text-slate-700'>
                    Ganti Gambar Utama (opsional)
                  </label>
                  <input
                    type='file'
                    name='primaryImage'
                    accept='image/*'
                    onChange={(event) => {
                      clearPrimaryImagePreview();
                      const file = event.target.files?.[0];
                      if (!file) return;
                      setPrimaryImagePreview(URL.createObjectURL(file));
                    }}
                    className='w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 file:mr-4 file:rounded-md file:border-0 file:bg-blue-600 file:px-3 file:py-2 file:text-white hover:file:bg-blue-700'
                  />
                </div>

                <div className='relative h-54 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 md:h-64'>
                  <Image
                    src={primaryImagePreview || item.image_url}
                    alt={item.title}
                    fill
                    sizes='(max-width: 1024px) 100vw, 28vw'
                    className='object-cover'
                  />
                </div>

                <div>
                  <label className='mb-1 block text-sm font-semibold text-slate-700'>
                    Tambah Gambar Galeri
                  </label>
                  <input
                    type='file'
                    name='images'
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

                {item.gallery?.length > 0 && (
                  <div className='rounded-lg border border-slate-200 bg-white p-3'>
                    <p className='text-sm font-semibold text-slate-800'>Galeri Saat Ini</p>
                    <p className='text-xs text-slate-500'>Centang gambar yang ingin dihapus saat update.</p>
                    <div className='mt-3 grid max-h-64 grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3'>
                      {item.gallery.map((image) => (
                        <label key={image.id} className='space-y-1 rounded-md p-1 text-xs text-slate-600 hover:bg-slate-50'>
                          <div className='relative aspect-[4/3] overflow-hidden rounded-md border border-slate-200 bg-slate-100'>
                            <Image
                              src={image.image_url}
                              alt={`${item.title} gallery ${image.id}`}
                              fill
                              sizes='(max-width: 640px) 50vw, 20vw'
                              className='object-cover'
                            />
                          </div>
                          <span className='inline-flex items-center gap-1'>
                            <input
                              type='checkbox'
                              name='removeImageIds'
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

                <label className='inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700'>
                  <input
                    type='checkbox'
                    name='isActive'
                    defaultChecked={item.is_active}
                    className='h-4 w-4'
                  />
                  Aktif tampil di website
                </label>

                <SubmitButton />
                <Feedback state={state} />
              </div>
        </form>
      )}
    </div>
  );
}
