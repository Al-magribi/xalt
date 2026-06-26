"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import AppImage from "@/components/ui/AppImage";
import { container, item } from "./sharedMotion";

const FALLBACK_IMAGE_SRC = "/placeholder-image.svg";

function getSafeImageSrc(value) {
  if (typeof value === "string" && value.trim()) return value;
  return FALLBACK_IMAGE_SRC;
}

export default function MerchandiseSection({ items = [] }) {
  return (
    <section className='mx-auto max-w-7xl px-6 pb-20 md:px-10'>
      <motion.div variants={container} initial='hidden' whileInView='show' viewport={{ once: true, amount: 0.15 }}>
        <p className='font-display text-3xl font-semibold md:text-4xl'>Jenis Merchandise</p>
        <p className='mt-3 max-w-3xl text-slate-600'>
          Pilih kategori produk populer untuk kebutuhan branding, onboarding, dan event perusahaan.
        </p>
        <div className='mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4'>
          {items.slice(0, 8).map((entry) => (
            <Link key={entry.id ?? entry.slug ?? entry.title} href={`/merchandise/${entry.slug}`} className='block'>
              <motion.article
                variants={item}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className='relative aspect-[2/1] w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100'
              >
                <AppImage
                  src={getSafeImageSrc(entry.image)}
                  alt={entry.title}
                  fill
                  className='object-contain'
                  sizes='(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw'
                />
                <div className='absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent' />
                <div className='absolute bottom-4 left-4 rounded-xl bg-white/95 px-4 py-2 text-sm font-semibold text-slate-800'>
                  {entry.title}
                </div>
              </motion.article>
            </Link>
          ))}
        </div>
        <div className='mt-8'>
          <Link
            href='/merchandise'
            className='inline-flex items-center justify-center rounded-xl bg-blue-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800'
          >
            Tampilkan lebih banyak
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
