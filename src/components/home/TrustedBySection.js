"use client";

import { motion } from "framer-motion";
import AppImage from "@/components/ui/AppImage";
import { resolveAssetUrl } from "@/utils/media";

function LogoMarqueeRow({ logos, reverse = false, duration = 28 }) {
  if (!Array.isArray(logos) || logos.length === 0) return null;
  const loopedLogos = [...logos, ...logos];

  return (
    <div className='relative overflow-hidden'>
      <motion.div
        animate={{ x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }}
        transition={{
          duration,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
        className='flex w-max gap-4'
      >
        {loopedLogos.map((logo, index) => (
          <div
            key={`${logo.name}-${index}`}
            className='flex h-24 w-56 shrink-0 flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3'
          >
            <AppImage
              src={resolveAssetUrl(logo.src)}
              alt={`${logo.name} logo`}
              width={180}
              height={64}
              className='h-12 w-auto object-contain opacity-90'
            />
            <p className='mt-2 truncate text-center text-xs font-semibold text-slate-600'>
              {logo.name}
            </p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export default function TrustedBySection({ logos = [] }) {
  const trustedLogos = Array.isArray(logos)
    ? logos
        .filter((logo) => logo.logo_url)
        .map((logo) => ({
          name: logo.brand_name || "Brand",
          src: logo.logo_url,
        }))
    : [];

  return (
    <section className='mx-auto max-w-7xl px-6 pb-20 pt-16 md:px-10'>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className='rounded-3xl border border-slate-200 bg-slate-100 p-6 md:p-8'
      >
        <div className='flex flex-col gap-6 md:flex-row md:items-center md:gap-8'>
          <div className='shrink-0 md:w-72'>
            <p className='text-sm font-semibold tracking-wide text-slate-500 uppercase'>
              Dipercaya oleh brand terkemuka
            </p>
            <div className='mt-4 space-y-3 text-slate-700'>
              <p className='flex items-center gap-2 text-sm'>
                <span className='text-lg text-blue-900'>*</span>
                <span className='font-semibold'>4.8</span>
                <span>berdasarkan 3.200+ ulasan klien</span>
              </p>
              <p className='flex items-center gap-2 text-sm'>
                <span className='text-lg text-blue-900'>*</span>
                <span className='font-semibold'>4.9</span>
                <span>kepuasan kualitas dan ketepatan kirim</span>
              </p>
            </div>
          </div>

          <div className='hidden h-24 w-px bg-slate-300 md:block' />

          <div className='min-w-0 flex-1 space-y-4'>
            {trustedLogos.length === 0 ? (
              <div className='rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-500'>
                Belum ada logo trusted company.
              </div>
            ) : (
              <>
                <LogoMarqueeRow logos={trustedLogos} duration={100} />
                <LogoMarqueeRow logos={[...trustedLogos].reverse()} reverse duration={100} />
              </>
            )}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
