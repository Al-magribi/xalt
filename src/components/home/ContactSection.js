"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function ContactSection() {
  const [contactName, setContactName] = useState("");
  const [contactMessage, setContactMessage] = useState("");

  const handleWhatsAppSubmit = (event) => {
    event.preventDefault();

    const name = contactName.trim();
    const message = contactMessage.trim();

    if (!name || !message) {
      return;
    }

    const text = `Halo X-ALT, saya ${name}. ${message}`;
    const whatsappUrl = `https://wa.me/6287720776871?text=${encodeURIComponent(text)}`;

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <section id='kontak' className='mx-auto max-w-7xl px-4 pb-24 sm:px-6 md:px-10'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className='relative overflow-hidden rounded-2xl bg-blue-900 p-5 text-white sm:rounded-3xl sm:p-8 md:p-10 lg:p-14'
      >
        <div className='absolute -top-10 right-0 h-40 w-40 rounded-full bg-blue-600/60 blur-3xl sm:h-56 sm:w-56' />
        <div className='relative grid gap-6 lg:grid-cols-2 lg:items-start lg:gap-10'>
          <div>
            <p className='font-display text-2xl leading-tight font-semibold sm:text-3xl md:text-4xl'>
              Hubungi X-ALT via WhatsApp
            </p>
            <p className='mt-3 max-w-xl text-sm text-blue-100 sm:text-base'>
              Isi form singkat di samping, lalu klik kirim. Kami akan membuka tab WhatsApp baru
              dengan pesan Anda.
            </p>
            <div className='mt-5 inline-flex rounded-full border border-blue-700/70 bg-blue-950/30 px-4 py-2 text-xs font-medium text-blue-100 sm:text-sm'>
              Respon cepat di jam kerja
            </div>
          </div>

          <form
            onSubmit={handleWhatsAppSubmit}
            className='rounded-2xl border border-blue-700/60 bg-blue-950/35 p-4 sm:p-6'
          >
            <label className='text-sm font-medium text-blue-100' htmlFor='contact-name'>
              Nama
            </label>
            <input
              id='contact-name'
              type='text'
              value={contactName}
              onChange={(event) => setContactName(event.target.value)}
              placeholder='Masukkan nama Anda'
              className='mt-2 w-full rounded-xl border border-blue-700 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-blue-200 focus:ring-2 sm:text-base'
              required
            />

            <label className='mt-4 block text-sm font-medium text-blue-100' htmlFor='contact-message'>
              Pesan
            </label>
            <textarea
              id='contact-message'
              value={contactMessage}
              onChange={(event) => setContactMessage(event.target.value)}
              placeholder='Contoh: Saya ingin diskusi kebutuhan Event Kit untuk 300 peserta.'
              className='mt-2 min-h-32 w-full resize-y rounded-xl border border-blue-700 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-blue-200 focus:ring-2 sm:text-base'
              required
            />

            <button
              type='submit'
              className='mt-5 inline-flex w-full items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-blue-900 transition hover:bg-blue-50 sm:w-auto'
            >
              Kirim ke WhatsApp
            </button>
          </form>
        </div>
      </motion.div>
    </section>
  );
}
