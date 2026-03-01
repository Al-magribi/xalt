"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { testimonials as staticTestimonials } from "./homeData";
import { container } from "./sharedMotion";

export default function TestimonialsSection({ testimonials = [] }) {
  const testimonialItems =
    Array.isArray(testimonials) && testimonials.length > 0
      ? testimonials
      : staticTestimonials;
  const [testimonialStartIndex, setTestimonialStartIndex] = useState(0);
  const [testimonialWindow, setTestimonialWindow] = useState(1);

  useEffect(() => {
    const syncWindowByViewport = () => {
      if (window.innerWidth >= 1280) {
        setTestimonialWindow(3);
        return;
      }

      if (window.innerWidth >= 768) {
        setTestimonialWindow(2);
        return;
      }

      setTestimonialWindow(1);
    };

    syncWindowByViewport();
    window.addEventListener("resize", syncWindowByViewport);

    return () => window.removeEventListener("resize", syncWindowByViewport);
  }, []);

  const visibleWindow = Math.min(testimonialWindow, testimonialItems.length);

  const visibleTestimonials = Array.from({ length: visibleWindow }, (_, offset) => {
    const index = (testimonialStartIndex + offset) % testimonialItems.length;
    return testimonialItems[index];
  });

  const goPrevTestimonials = () => {
    setTestimonialStartIndex((prev) => (prev - 1 + testimonialItems.length) % testimonialItems.length);
  };

  const goNextTestimonials = () => {
    setTestimonialStartIndex((prev) => (prev + 1) % testimonialItems.length);
  };

  if (testimonialItems.length === 0) {
    return null;
  }

  return (
    <section className='mx-auto max-w-7xl px-4 pb-20 sm:px-6 md:px-10'>
      <motion.div
        variants={container}
        initial='hidden'
        whileInView='show'
        viewport={{ once: true, amount: 0.2 }}
        className='rounded-2xl border border-slate-200 bg-slate-100 p-5 sm:rounded-3xl sm:p-8 md:p-10'
      >
        <p className='text-center font-display text-2xl leading-tight font-semibold sm:text-3xl md:text-5xl'>
          Brand senang berkembang bersama X-ALT
        </p>
        <p className='mt-3 text-center text-base text-slate-600 sm:text-lg'>Lihat pengalaman klien kami</p>

        <AnimatePresence mode='wait'>
          <motion.div
            key={testimonialStartIndex}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className='mt-8 grid gap-4 sm:mt-10 sm:gap-6 md:grid-cols-2 xl:grid-cols-3'
          >
            {visibleTestimonials.map((entry) => (
              <article
                key={`${entry.id || entry.client_name || entry.name}-${entry.title}`}
                className='flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 sm:p-6'
              >
                <div className='mb-4 flex gap-1.5'>
                  {Array.from({ length: Number(entry.rating || 5) }, (_, index) => (
                    <span
                      key={index}
                      className='inline-flex h-5 w-5 items-center justify-center rounded-[4px] bg-emerald-500 text-[10px] font-bold text-white sm:h-6 sm:w-6 sm:text-xs'
                    >
                      <svg viewBox='0 0 24 24' fill='currentColor' className='h-3 w-3 sm:h-3.5 sm:w-3.5'>
                        <path d='m12 3.5 2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.7 6.8 19.5l1-5.8-4.2-4.1 5.8-.8L12 3.5Z' />
                      </svg>
                    </span>
                  ))}
                </div>
                <p className='text-sm font-semibold text-slate-800'>{entry.client_name || entry.name}</p>
                <h3 className='mt-3 text-xl leading-tight font-semibold text-slate-900 sm:mt-4 sm:text-2xl lg:text-3xl'>
                  {entry.title}
                </h3>
                <p className='mt-4 flex-1 text-sm text-slate-600 sm:text-base'>{entry.quote}</p>
                {entry.link_url || entry.link ? (
                  <a
                    href={entry.link_url || entry.link}
                    className='mt-5 inline-flex text-sm font-semibold text-blue-900 underline-offset-4 hover:underline'
                  >
                    Baca selengkapnya
                  </a>
                ) : null}
              </article>
            ))}
          </motion.div>
        </AnimatePresence>

        <div className='mt-6 flex items-center justify-center gap-3 sm:mt-8'>
          <button
            type='button'
            onClick={goPrevTestimonials}
            aria-label='Testimoni sebelumnya'
            className='inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-400 text-slate-700 transition hover:border-blue-900 hover:text-blue-900 sm:h-11 sm:w-11'
          >
            <svg viewBox='0 0 24 24' fill='none' className='h-5 w-5'>
              <path
                d='m14 6-6 6 6 6'
                stroke='currentColor'
                strokeWidth='1.8'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
          </button>
          <button
            type='button'
            onClick={goNextTestimonials}
            aria-label='Testimoni berikutnya'
            className='inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-400 text-slate-700 transition hover:border-blue-900 hover:text-blue-900 sm:h-11 sm:w-11'
          >
            <svg viewBox='0 0 24 24' fill='none' className='h-5 w-5'>
              <path
                d='m10 6 6 6-6 6'
                stroke='currentColor'
                strokeWidth='1.8'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
          </button>
        </div>
      </motion.div>
    </section>
  );
}
