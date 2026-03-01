"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { container, item } from "./sharedMotion";

export default function CatalogSection({ kits = [] }) {
  return (
    <section id='katalog' className='mx-auto max-w-7xl px-6 pb-20 md:px-10'>
      <motion.div
        variants={container}
        initial='hidden'
        whileInView='show'
        viewport={{ once: true, amount: 0.1 }}
      >
        <p className='font-display text-3xl font-semibold md:text-4xl'>
          Katalog Kit
        </p>
        <p className='mt-3 max-w-3xl text-slate-600'>
          Pilihan paket yang dapat disesuaikan dengan kebutuhan campaign dan
          skala distribusi.
        </p>

        <div className='mt-8 grid gap-6 md:grid-cols-2'>
          {kits.map((kit) => (
            <motion.article
              key={kit.slug}
              variants={item}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
              className='group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm'
            >
              <div className='relative h-75 bg-slate-100'>
                <Image
                  src={kit.image}
                  alt={kit.title}
                  fill
                  className='object-cover transition duration-300 group-hover:scale-105'
                  sizes='(max-width: 768px) 100vw, 50vw'
                />
              </div>
              <div className='p-6'>
                <h3 className='font-display text-2xl font-semibold'>
                  {kit.title}
                </h3>
                <p className='mt-3 text-slate-600'>{kit.description}</p>
                <Link
                  href={`/catalog/${kit.slug}`}
                  className='mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-900 transition hover:text-blue-700'
                >
                  Lihat detail katalog
                  <span aria-hidden='true'>&rarr;</span>
                </Link>
              </div>
            </motion.article>
          ))}
        </div>

        {kits.length === 0 && (
          <div className='mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500'>
            Belum ada kit aktif untuk ditampilkan.
          </div>
        )}
      </motion.div>
    </section>
  );
}
