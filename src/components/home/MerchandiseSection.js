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

export default function MerchandiseSection({ categories = [] }) {
  return (
    <section id='katalog-produk' className='mx-auto max-w-7xl px-6 pb-20 md:px-10'>
      <motion.div variants={container} initial='hidden' whileInView='show' viewport={{ once: true, amount: 0.15 }}>
        <p className='font-display text-3xl font-semibold text-slate-900 md:text-4xl'>
          Katalog Produk
        </p>
        <p className='mt-3 max-w-3xl text-slate-600'>
          Pilih kategori produk populer untuk kebutuhan branding, onboarding, dan event perusahaan.
        </p>

        <div className='mt-8 grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 xl:grid-cols-4'>
          {categories.slice(0, 8).map((entry) => (
            <Link
              key={entry.id ?? entry.slug ?? entry.title}
              href={`/katalog/${entry.slug}`}
              className='block'
            >
              <motion.article
                variants={item}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md'
              >
                <div className='relative aspect-[4/5] w-full bg-white'>
                  <AppImage
                    src={getSafeImageSrc(entry.image)}
                    alt={entry.title}
                    fill
                    className='object-contain object-center p-3'
                    sizes='(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw'
                  />
                </div>
                <div className='bg-blue-900 px-3 py-3 text-center'>
                  <p className='line-clamp-2 text-sm font-semibold text-white sm:text-base'>
                    {entry.title}
                  </p>
                </div>
              </motion.article>
            </Link>
          ))}
        </div>

        {categories.length === 0 ? (
          <div className='mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500'>
            Belum ada kategori produk.
          </div>
        ) : null}

        <div className='mt-8'>
          <Link
            href='/katalog'
            className='inline-flex items-center justify-center rounded-xl bg-blue-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800'
          >
            Lihat semua katalog
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
