"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { container, item } from "./sharedMotion";

export default function HeroSection({ websiteConfig }) {
  const hero = {
    title: websiteConfig?.hero_title || "",
    description: websiteConfig?.hero_description || "",
    note: websiteConfig?.hero_note || "",
    imageUrl: websiteConfig?.hero_image_url || "",
    badgeTitle: websiteConfig?.hero_badge_title || "",
    badgeText: websiteConfig?.hero_badge_text || "",
  };

  return (
    <section className='relative border-b border-slate-200 bg-slate-50'>
      <div className='mx-auto grid min-h-[68vh] max-w-7xl gap-8 px-4 py-10 sm:px-6 sm:py-12 md:grid-cols-2 md:items-center md:gap-10 md:px-10 md:py-16'>
        <motion.div variants={container} initial='hidden' animate='show' className='order-2 md:order-1'>
          <motion.h1
            variants={item}
            className='font-display max-w-xl text-4xl leading-[1.1] font-semibold tracking-tight sm:text-5xl lg:text-6xl'
          >
            {hero.title}
          </motion.h1>

          <motion.p
            variants={item}
            className='mt-4 max-w-xl text-base leading-relaxed text-slate-600 sm:mt-5 sm:text-lg'
          >
            {hero.description}
          </motion.p>

          <motion.div
            variants={item}
            className='mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:gap-4'
          >
            <a
              href='#katalog'
              className='inline-flex items-center justify-center rounded-xl bg-blue-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-800'
            >
              Lihat Katalog
            </a>
            <a
              href='#kontak'
              className='inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-100'
            >
              Konsultasi Enterprise
            </a>
          </motion.div>

          <motion.p
            variants={item}
            className='mt-8 text-sm text-slate-500 sm:mt-10'
          >
            {hero.note}
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 26 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className='relative order-1 md:order-2'
        >
          <div className='relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-2.5 shadow-xl sm:rounded-3xl sm:p-3'>
            <div className='relative h-[300px] w-full overflow-hidden rounded-xl sm:h-[380px] sm:rounded-2xl md:h-[420px] lg:h-[460px]'>
              {hero.imageUrl ? (
                <Image
                  src={hero.imageUrl}
                  alt={hero.title || "Hero image"}
                  fill
                  className='object-cover'
                  sizes='(max-width: 768px) 100vw, 50vw'
                  priority
                />
              ) : (
                <div className='flex h-full items-center justify-center bg-slate-100 text-sm text-slate-400'>
                  Belum ada gambar hero
                </div>
              )}
            </div>
          </div>

          <motion.div
            animate={{ y: [0, -7, 0] }}
            transition={{
              duration: 4.5,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            className='absolute -bottom-5 left-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-lg sm:-bottom-6 sm:-left-2 sm:p-4 md:-left-8'
          >
            <p className='text-xs font-semibold tracking-wide text-blue-900 uppercase'>
              {hero.badgeTitle}
            </p>
            <p className='mt-1 text-sm text-slate-600'>
              {hero.badgeText}
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
