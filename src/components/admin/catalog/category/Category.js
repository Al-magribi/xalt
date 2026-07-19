"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { FiCheckCircle, FiEdit2, FiXCircle } from "react-icons/fi";
import { deleteMerchandiseCategoryAction } from "@/actions/catalog";
import CategoryCreateModal from "@/components/admin/catalog/category/CategoryCreateModal";
import CategoryUpdateModal from "@/components/admin/catalog/category/CategoryUpdateModal";
import AppImage from "@/components/ui/AppImage";

const INITIAL_FORM_STATE = { ok: false, message: "" };
const FALLBACK_IMAGE_SRC = "/placeholder-image.svg";

function getSafeImageSrc(value) {
  if (typeof value === "string" && value.trim()) return value;
  return FALLBACK_IMAGE_SRC;
}

function SubmitButton({ idleLabel, pendingLabel, className }) {
  const { pending } = useFormStatus();
  return (
    <button type='submit' disabled={pending} className={className}>
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}

function Feedback({ state }) {
  if (!state?.message) return null;

  const baseClass =
    "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium";
  if (state.ok) {
    return (
      <p className={`${baseClass} bg-emerald-50 text-emerald-700`}>
        <FiCheckCircle className='h-4 w-4' />
        {state.message}
      </p>
    );
  }

  return (
    <p className={`${baseClass} bg-rose-50 text-rose-700`}>
      <FiXCircle className='h-4 w-4' />
      {state.message}
    </p>
  );
}

function DeleteCategoryForm({ id }) {
  const [state, formAction] = useActionState(
    deleteMerchandiseCategoryAction,
    INITIAL_FORM_STATE,
  );

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (
          !window.confirm(
            "Hapus kategori ini? Produk yang terhubung akan kehilangan kategori.",
          )
        ) {
          event.preventDefault();
        }
      }}
      className='flex flex-wrap items-center gap-2'
    >
      <input type='hidden' name='id' value={id} />
      <SubmitButton
        idleLabel='Hapus'
        pendingLabel='Menghapus...'
        className='inline-flex items-center gap-1 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-70'
      />
      <Feedback state={state} />
    </form>
  );
}

export default function Category({ categories = [] }) {
  const [editingItem, setEditingItem] = useState(null);

  return (
    <section className='space-y-5'>
      <article className='rounded-xl border border-slate-200 bg-white p-4'>
        <div className='flex flex-wrap items-start justify-between gap-3'>
          <div>
            <h3 className='text-base font-semibold text-slate-900'>
              Kategori Katalog
            </h3>
            <p className='mt-1 text-sm text-slate-500'>
              Kelola kategori untuk halaman `/katalog`.
            </p>
          </div>
          <CategoryCreateModal />
        </div>
      </article>

      {categories.length === 0 ? (
        <div className='rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500'>
          Belum ada kategori. Tambahkan kategori baru untuk mulai mengelompokkan produk.
        </div>
      ) : (
        <div className='grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4'>
          {categories.map((item) => (
            <article
              key={item.id}
              className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'
            >
              <div className='relative aspect-[4/5] w-full bg-white'>
                <AppImage
                  src={getSafeImageSrc(item.image_url)}
                  alt={item.title}
                  fill
                  className='object-contain object-center p-3'
                  sizes='(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw'
                />
              </div>

              <div className='border-t border-slate-100 px-3 py-3 text-center'>
                <h4 className='line-clamp-2 text-sm font-semibold text-slate-900 sm:text-base'>
                  {item.title}
                </h4>
                <p className='mt-1 truncate text-xs text-slate-500'>/{item.slug}</p>
              </div>

              <div className='space-y-3 border-t border-slate-100 p-3'>
                <div className='flex items-center justify-between gap-2'>
                  <p className='text-xs text-slate-500'>
                    {item.product_count} produk · urutan {item.sort_order}
                  </p>
                  <span
                    className={`shrink-0 rounded-full px-2 py-1 text-xs font-semibold ${
                      item.is_active
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {item.is_active ? "Aktif" : "Nonaktif"}
                  </span>
                </div>
                {item.description ? (
                  <p className='line-clamp-2 text-xs text-slate-600'>
                    {item.description}
                  </p>
                ) : null}
                <div className='flex flex-wrap items-center gap-2'>
                  <button
                    type='button'
                    onClick={() => setEditingItem(item)}
                    className='inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50'
                  >
                    <FiEdit2 className='h-3.5 w-3.5' />
                    Edit
                  </button>
                  <DeleteCategoryForm id={item.id} />
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {editingItem ? (
        <CategoryUpdateModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
        />
      ) : null}
    </section>
  );
}
