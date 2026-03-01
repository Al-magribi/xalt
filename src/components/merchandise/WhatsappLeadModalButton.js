"use client";

import { useState, useTransition } from "react";
import { FaWhatsapp, FaTimes } from "react-icons/fa";
import { submitWhatsappLeadAction } from "@/actions/contact";

const INITIAL_FORM = {
  name: "",
  email: "",
  whatsapp: "",
  message: "",
};

export default function WhatsappLeadModalButton({
  productSlug,
  productTitle,
  minOrder,
  displayPrice,
  websiteWhatsappNumber,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({
    ...INITIAL_FORM,
    message: `Saya ingin order ${productTitle}. Harga ${displayPrice}, min. order ${minOrder} pcs.`,
  });
  const [feedback, setFeedback] = useState({ ok: false, message: "" });
  const [isSubmitting, startSubmitting] = useTransition();

  const onClose = () => {
    setIsOpen(false);
    setFeedback({ ok: false, message: "" });
  };

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = (event) => {
    event.preventDefault();
    setFeedback({ ok: false, message: "" });

    startSubmitting(async () => {
      const response = await submitWhatsappLeadAction({
        name: form.name,
        email: form.email,
        whatsapp: form.whatsapp,
        message: form.message,
        sourcePage: `/merchandise/${productSlug}`,
        productSlug,
        productTitle,
        websiteWhatsappNumber,
      });

      if (!response?.ok) {
        setFeedback({ ok: false, message: response?.message || "Gagal mengirim data." });
        return;
      }

      const redirectUrl = String(response?.data?.redirectUrl || "").trim();
      if (!redirectUrl) {
        setFeedback({ ok: false, message: "URL WhatsApp tidak tersedia." });
        return;
      }

      onClose();
      window.open(redirectUrl, "_blank", "noopener,noreferrer");
    });
  };

  return (
    <>
      <button
        type='button'
        onClick={() => setIsOpen(true)}
        className='inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 px-5 py-3 text-sm font-semibold text-blue-900 transition hover:border-blue-300 hover:bg-blue-50 sm:text-base'
      >
        <FaWhatsapp className='text-lg' />
        Hub WhatsApp
      </button>

      {isOpen ? (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4'>
          <div className='w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl sm:p-6'>
            <div className='flex items-start justify-between gap-4'>
              <div>
                <h2 className='text-xl font-semibold text-slate-900'>Hubungi via WhatsApp</h2>
                <p className='mt-1 text-sm text-slate-600'>
                  Isi data berikut. Jika berhasil, Anda akan dialihkan ke WhatsApp.
                </p>
              </div>
              <button
                type='button'
                onClick={onClose}
                className='rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700'
                aria-label='Tutup modal'
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={onSubmit} className='mt-5 space-y-3'>
              <label className='block space-y-1 text-sm'>
                <span className='font-medium text-slate-700'>Nama</span>
                <input
                  name='name'
                  value={form.name}
                  onChange={onChange}
                  className='w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-blue-200 focus:border-blue-500 focus:ring'
                  required
                />
              </label>

              <label className='block space-y-1 text-sm'>
                <span className='font-medium text-slate-700'>Email</span>
                <input
                  type='email'
                  name='email'
                  value={form.email}
                  onChange={onChange}
                  className='w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-blue-200 focus:border-blue-500 focus:ring'
                  required
                />
              </label>

              <label className='block space-y-1 text-sm'>
                <span className='font-medium text-slate-700'>WhatsApp</span>
                <input
                  name='whatsapp'
                  value={form.whatsapp}
                  onChange={onChange}
                  placeholder='628xxxxxxxxxx'
                  className='w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-blue-200 focus:border-blue-500 focus:ring'
                  required
                />
              </label>

              <label className='block space-y-1 text-sm'>
                <span className='font-medium text-slate-700'>Pesan</span>
                <textarea
                  name='message'
                  rows={4}
                  value={form.message}
                  onChange={onChange}
                  className='w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-blue-200 focus:border-blue-500 focus:ring'
                  required
                />
              </label>

              {feedback.message ? (
                <p className={`text-sm ${feedback.ok ? "text-emerald-700" : "text-rose-700"}`}>{feedback.message}</p>
              ) : null}

              <div className='flex justify-end gap-2 pt-1'>
                <button
                  type='button'
                  onClick={onClose}
                  className='rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50'
                >
                  Batal
                </button>
                <button
                  type='submit'
                  disabled={isSubmitting}
                  className='rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-70'
                >
                  {isSubmitting ? "Menyimpan..." : "Lanjut ke WhatsApp"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
