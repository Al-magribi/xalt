"use client";

import { motion } from "framer-motion";
import { faqs as staticFaqs } from "./homeData";

export default function FaqSection({ faqs = [] }) {
  const faqItems = Array.isArray(faqs) && faqs.length > 0 ? faqs : staticFaqs;

  return (
    <section id='faq' className='mx-auto max-w-7xl px-4 pb-20 sm:px-6 md:px-10'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className='rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:rounded-3xl sm:p-8 md:p-10'
      >
        <p className='font-display text-2xl font-semibold sm:text-3xl md:text-4xl'>FAQ</p>
        <p className='mt-2 text-sm text-slate-600 sm:text-base'>
          Pertanyaan umum seputar layanan, proses produksi, dan pengiriman X-ALT.
        </p>

        <div className='mt-6 space-y-3 sm:mt-8 sm:space-y-4'>
          {faqItems.map((faq) => (
            <details
              key={faq.id || faq.question}
              className='group rounded-2xl border border-slate-200 bg-white px-4 py-4 transition open:border-blue-300 sm:px-6'
            >
              <summary className='flex cursor-pointer list-none items-start justify-between gap-4'>
                <span className='text-sm font-semibold text-slate-900 sm:text-base'>{faq.question}</span>
                <span className='mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-slate-300 text-slate-700 transition group-open:rotate-45 group-open:border-blue-700 group-open:text-blue-900'>
                  <svg viewBox='0 0 24 24' fill='none' className='h-3.5 w-3.5'>
                    <path
                      d='M12 5v14M5 12h14'
                      stroke='currentColor'
                      strokeWidth='1.8'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                </span>
              </summary>
              <p className='mt-3 pr-1 text-sm leading-relaxed text-slate-600 sm:mt-4 sm:text-base'>{faq.answer}</p>
            </details>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
