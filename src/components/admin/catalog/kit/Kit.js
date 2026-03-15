"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { FiCheckCircle, FiXCircle } from "react-icons/fi";
import { deleteKitAction } from "@/actions/catalog";
import KitCreateModal from "@/components/admin/catalog/kit/KitCreateModal";
import KitUpdateModal from "@/components/admin/catalog/kit/KitUpdateModal";
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
    "mt-3 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium";
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

function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function splitDescriptionParagraphs(text) {
  return String(text || "")
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function DeleteKitForm({ id }) {
  const [state, formAction] = useActionState(
    deleteKitAction,
    INITIAL_FORM_STATE,
  );

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (
          !window.confirm(
            "Hapus kit ini? Semua gambar lokal akan ikut dihapus.",
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

export default function Kit({ kits = [] }) {
  return (
    <section className='space-y-5'>
      <article className='rounded-xl border border-slate-200 bg-white p-4'>
        <div className='flex items-center justify-between gap-3'>
          <div>
            <h3 className='text-base font-semibold text-slate-900'>
              Manajemen Kit
            </h3>
            <p className='text-sm text-slate-500'>
              Kelola data kit untuk katalog website.
            </p>
          </div>
          <KitCreateModal />
        </div>
      </article>

      <article className='space-y-3 rounded-xl border border-slate-200 bg-white p-4'>
        <div className='flex items-center justify-between'>
          <h3 className='text-base font-semibold text-slate-900'>
            Daftar Kit ({kits.length})
          </h3>
        </div>

        {kits.length === 0 ? (
          <div className='rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500'>
            Belum ada kit. Tambahkan data baru lewat tombol "Tambah Kit".
          </div>
        ) : (
          <div className='space-y-3'>
            {kits.map((kit) => (
              <article
                key={kit.id}
                className='rounded-xl border border-slate-200 bg-slate-50'
              >
                <div className='flex flex-col gap-3 border-b border-slate-200 p-3 sm:flex-row sm:items-start sm:justify-between'>
                  <div className='flex items-start gap-3'>
                    <div className='relative h-16 w-20 overflow-hidden rounded-md border border-slate-200 bg-slate-100'>
                      <AppImage
                        src={getSafeImageSrc(kit.hero_image_url)}
                        alt={kit.title}
                        fill
                        sizes='80px'
                        className='object-cover'
                      />
                    </div>
                    <div>
                      <p className='text-sm font-semibold text-slate-900'>
                        {kit.title}
                      </p>
                      <p className='text-xs text-slate-500'>/{kit.slug}</p>
                      <p className='mt-1 text-xs text-slate-500'>
                        Update: {formatDate(kit.updated_at)} | Gallery:{" "}
                        {Array.isArray(kit.gallery) ? kit.gallery.length : 0}
                      </p>
                    </div>
                  </div>

                  <div className='flex items-center gap-2'>
                    <KitUpdateModal kit={kit} />
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        kit.is_active
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {kit.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                <div className='space-y-3 p-3'>
                  <div className='rounded-lg border border-slate-200 bg-white p-3'>
                    <div className='space-y-2 text-sm leading-6 text-slate-600'>
                      {splitDescriptionParagraphs(kit.description).map(
                        (paragraph, index) => (
                          <p
                            key={`${kit.id}-description-${index}`}
                            className='whitespace-pre-line'
                          >
                            {paragraph}
                          </p>
                        ),
                      )}
                    </div>
                  </div>
                  <DeleteKitForm id={kit.id} />
                </div>
              </article>
            ))}
          </div>
        )}
      </article>
    </section>
  );
}
