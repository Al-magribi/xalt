"use client";

import { motion } from "framer-motion";
import { processSteps } from "./homeData";
import { container, item } from "./sharedMotion";

export default function ProcessSection() {
  return (
    <section className='mx-auto max-w-7xl px-6 pb-20 md:px-10'>
      <motion.div variants={container} initial='hidden' whileInView='show' viewport={{ once: true, amount: 0.2 }}>
        <p className='font-display text-3xl font-semibold md:text-4xl'>Kenapa X-ALT</p>
        <p className='mt-3 max-w-3xl text-slate-600'>
          Proses kerja kami dibuat transparan dan terstruktur agar setiap campaign berjalan rapi
          dari awal hingga pengiriman.
        </p>
        <p className='mt-4 inline-flex rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold tracking-wide text-blue-900 uppercase'>
          {"brief -> mockup -> sample -> produksi -> QC -> kirim"}
        </p>

        <div className='relative mt-10'>
          <div className='absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-blue-100 via-blue-300 to-blue-100 lg:block' />
          <div className='grid gap-5 sm:grid-cols-2 lg:grid-cols-3'>
            {processSteps.map((step, index) => (
              <motion.article
                key={step.title}
                variants={item}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className='relative rounded-2xl border border-blue-100 bg-white p-6 shadow-sm'
              >
                <div className='mb-5 inline-flex h-14 w-14 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-lg font-semibold text-blue-900'>
                  {index + 1}
                </div>
                <h3 className='text-xl font-semibold'>{step.title}</h3>
                <p className='mt-2 text-slate-600'>{step.description}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
