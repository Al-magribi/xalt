"use client";

import Image from "next/image";
import { useActionState, useEffect, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiEdit2,
  FiSearch,
  FiToggleLeft,
  FiToggleRight,
  FiXCircle,
} from "react-icons/fi";
import { deleteMerchandiseAction } from "@/actions/catalog";
import MerchandiseCreateModal from "@/components/admin/catalog/merchandise/MerchandiseCreateModal";
import MerchandiseUpdateModal from "@/components/admin/catalog/merchandise/MerchandiseUpdateModal";

const INITIAL_FORM_STATE = { ok: false, message: "" };

function SubmitButton({ idleLabel, pendingLabel, className }) {
  const { pending } = useFormStatus();
  return (
    <button type='submit' disabled={pending} className={className}>
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}

function Feedback({ state, compact = false }) {
  if (!state?.message) return null;

  const baseClass = `${compact ? "" : "mt-3 "}inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium`;
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

function DeleteMerchandiseForm({ id }) {
  const [state, formAction] = useActionState(
    deleteMerchandiseAction,
    INITIAL_FORM_STATE,
  );

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (
          !window.confirm(
            "Hapus merchandise ini? Gambar lokal akan ikut dihapus.",
          )
        ) {
          event.preventDefault();
        }
      }}
      className='inline-flex items-center gap-2'
    >
      <input type='hidden' name='id' value={id} />
      <SubmitButton
        idleLabel='Hapus'
        pendingLabel='Menghapus...'
        className='inline-flex items-center justify-center rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-70'
      />
      <Feedback state={state} compact />
    </form>
  );
}

function formatMoney(value, currency) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: currency || "IDR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function splitDetailParagraphs(text) {
  return String(text || "")
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function formatOptionList(values = []) {
  if (!Array.isArray(values) || values.length === 0) return "-";
  return values.join(", ");
}

export default function Merchandise({
  items = [],
  mode = "list",
  editId = null,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const selectedItem =
    mode === "edit" ? items.find((entry) => entry.id === editId) : null;

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredItems = useMemo(() => {
    if (!normalizedQuery) return items;

    return items.filter((item) => {
      const title = String(item.title || "").toLowerCase();
      const slug = String(item.slug || "").toLowerCase();
      return [title, slug].some((value) =>
        value.includes(normalizedQuery),
      );
    });
  }, [items, normalizedQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));

  useEffect(() => {
    setCurrentPage(1);
  }, [normalizedQuery]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, endIndex);
  const shownFrom = filteredItems.length === 0 ? 0 : startIndex + 1;
  const shownTo = Math.min(endIndex, filteredItems.length);

  return (
    <section className='space-y-5'>
      <article className='rounded-xl border border-slate-200 bg-white p-4'>
        <div className='flex items-center justify-between gap-3'>
          <div>
            <h3 className='text-base font-semibold text-slate-900'>
              Manajemen Merchandise
            </h3>
            <p className='text-sm text-slate-500'>
              Kelola data merchandise untuk katalog website.
            </p>
          </div>
          <a
            href={
              mode === "create" || mode === "edit"
                ? "/admin/catalog?tab=merchandise"
                : "/admin/catalog?tab=merchandise&mode=create"
            }
            className='inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700'
          >
            {mode === "create" || mode === "edit"
              ? "Daftar Merchandise"
              : "+ Merchandise"}
          </a>
        </div>
        {mode === "list" ? (
          <div className='mt-3 border-t border-slate-200 pt-3'>
            <h4 className='text-base font-semibold text-slate-900'>
              Daftar Merchandise ({filteredItems.length})
            </h4>
          </div>
        ) : null}
      </article>

      {mode === "create" ? (
        <article className='rounded-xl border border-slate-200 bg-white p-4'>
          <h3 className='text-base font-semibold text-slate-900'>
            Tambah Merchandise
          </h3>
          <p className='text-sm text-slate-500'>Isi data merchandise baru.</p>
          <div className='mt-3'>
            <MerchandiseCreateModal />
          </div>
        </article>
      ) : null}

      {mode === "edit" ? (
        <article className='rounded-xl border border-slate-200 bg-white p-4'>
          <h3 className='text-base font-semibold text-slate-900'>
            Update Merchandise
          </h3>
          <p className='text-sm text-slate-500'>
            Perbarui data merchandise yang dipilih.
          </p>
          <div className='mt-3'>
            {selectedItem ? (
              <MerchandiseUpdateModal
                item={selectedItem}
                forceOpen
                showToggle={false}
              />
            ) : (
              <div className='rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500'>
                Merchandise tidak ditemukan.
              </div>
            )}
          </div>
        </article>
      ) : null}

      {mode === "list" ? (
        <article className='space-y-4 rounded-xl border border-slate-200 bg-white p-4'>
          <div className='rounded-xl border border-slate-200 bg-slate-50/70 p-3'>
            <div className='flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between'>
              <label className='relative block w-full lg:max-w-md'>
                <FiSearch className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400' />
                <input
                  type='search'
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder='Cari judul atau slug...'
                  className='w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                />
              </label>
              <p className='text-sm text-slate-600'>
                Menampilkan <span className='font-semibold'>{shownFrom}</span>-
                <span className='font-semibold'>{shownTo}</span> dari{" "}
                <span className='font-semibold'>{filteredItems.length}</span>{" "}
                data
              </p>
            </div>
          </div>

          {filteredItems.length === 0 ? (
            <div className='rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500'>
              {items.length === 0
                ? 'Belum ada merchandise. Tambahkan data baru lewat tombol "Tambah Merchandise".'
                : "Data tidak ditemukan. Coba kata kunci lain."}
            </div>
          ) : (
            <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
              {paginatedItems.map((item) => (
                <article
                  key={item.id}
                  className='rounded-xl border border-slate-200 bg-slate-50 shadow-sm'
                >
                  <div className='flex items-start gap-3 border-b border-slate-200 p-3'>
                    <div className='relative h-20 w-20 shrink-0 overflow-hidden rounded-md border border-slate-200 bg-slate-100'>
                      <Image
                        src={item.image_url}
                        alt={item.title}
                        fill
                        sizes='100px'
                        className='object-cover'
                      />
                    </div>
                    <div className='min-w-0 flex-1'>
                      <p className='truncate text-sm font-semibold text-slate-900'>
                        {item.title}
                      </p>
                      <p className='text-xs text-slate-500'>/{item.slug}</p>
                      <p className='mt-1 text-xs font-semibold text-blue-700'>
                        {formatMoney(item.price_amount, item.currency)}
                      </p>
                      <p className='text-xs text-slate-500'>
                        Min order: {item.min_order}
                      </p>
                      <p className='text-xs text-slate-500'>
                        Size: {formatOptionList(item.size_options)}
                      </p>
                      <p className='text-xs text-slate-500'>
                        Bahan: {formatOptionList(item.material_options)}
                      </p>
                      <p className='text-xs text-slate-500'>
                        Total gambar: {(item.gallery?.length || 0) + 1}
                      </p>
                      <p className='text-xs text-slate-500'>
                        Update: {formatDate(item.updated_at)}
                      </p>
                    </div>
                  </div>

                  <div className='space-y-3 p-3'>
                    <div className='space-y-2 text-sm leading-6 text-slate-600'>
                      {splitDetailParagraphs(item.detail).map(
                        (paragraph, index) => (
                          <p
                            key={`${item.id}-detail-${index}`}
                            className='whitespace-pre-line'
                          >
                            {paragraph}
                          </p>
                        ),
                      )}
                    </div>

                    <div className='flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-2'>
                      <div className='inline-flex flex-wrap items-center gap-2'>
                        <a
                          href={`/admin/catalog?tab=merchandise&mode=edit&id=${item.id}`}
                          className='inline-flex items-center justify-center gap-1 rounded-lg border border-blue-300 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100'
                        >
                          <FiEdit2 className='h-3.5 w-3.5' />
                          Update
                        </a>
                        <DeleteMerchandiseForm id={item.id} />
                      </div>

                      <div className='inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5'>
                        <span className='text-[11px] font-semibold uppercase tracking-wide text-slate-500'>
                          Status
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                            item.is_active
                              ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200"
                              : "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
                          }`}
                        >
                          {item.is_active ? (
                            <FiToggleRight className='h-3.5 w-3.5' />
                          ) : (
                            <FiToggleLeft className='h-3.5 w-3.5' />
                          )}
                          {item.is_active ? "Aktif" : "Nonaktif"}
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {filteredItems.length > 0 ? (
            <div className='flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between'>
              <p className='text-sm text-slate-600'>
                Halaman <span className='font-semibold'>{currentPage}</span> dari{" "}
                <span className='font-semibold'>{totalPages}</span>
              </p>
              <div className='inline-flex items-center gap-2'>
                <button
                  type='button'
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className='inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50'
                >
                  <FiChevronLeft className='h-4 w-4' />
                  Sebelumnya
                </button>
                <button
                  type='button'
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  className='inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50'
                >
                  Berikutnya
                  <FiChevronRight className='h-4 w-4' />
                </button>
              </div>
            </div>
          ) : null}
        </article>
      ) : null}
    </section>
  );
}
