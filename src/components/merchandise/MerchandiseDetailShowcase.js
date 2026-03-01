"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiFileText,
  FiInfo,
} from "react-icons/fi";
import WhatsappLeadModalButton from "@/components/merchandise/WhatsappLeadModalButton";

function splitDescriptionParagraphs(text) {
  return String(text || "")
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export default function MerchandiseDetailShowcase({
  product,
  galleryImages = [],
  displayPrice,
  whatsappNumber,
}) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("description");

  const images = useMemo(() => {
    const normalized = Array.isArray(galleryImages) ? galleryImages : [];
    return normalized.length > 0 ? normalized : [product.image].filter(Boolean);
  }, [galleryImages, product.image]);

  const activeImage = images[activeImageIndex] || images[0] || product.image;
  const descriptionParagraphs = splitDescriptionParagraphs(product.description);

  function showPreviousImage() {
    setActiveImageIndex((prev) => (prev <= 0 ? images.length - 1 : prev - 1));
  }

  function showNextImage() {
    setActiveImageIndex((prev) => (prev >= images.length - 1 ? 0 : prev + 1));
  }

  return (
    <div className='mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:mt-8 lg:p-6'>
      <div className='grid gap-8 lg:grid-cols-[minmax(0,500px)_minmax(0,1fr)] lg:items-start xl:grid-cols-[minmax(0,540px)_minmax(0,1fr)]'>
        <div className='space-y-3'>
          <div className='relative overflow-hidden rounded-2xl bg-white'>
            <div className='relative h-[280px] overflow-hidden rounded-2xl sm:h-[360px] md:h-[440px] lg:h-[480px]'>
              <Image
                src={activeImage}
                alt={`${product.title} ${activeImageIndex + 1}`}
                fill
                className='object-cover'
                sizes='(max-width: 1024px) 100vw, 50vw'
                priority
              />
            </div>

            {images.length > 1 ? (
              <>
                <button
                  type='button'
                  onClick={showPreviousImage}
                  className='absolute left-3 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-700 shadow-sm backdrop-blur transition hover:bg-white sm:h-10 sm:w-10'
                  aria-label='Gambar sebelumnya'
                >
                  <FiChevronLeft className='h-5 w-5' />
                </button>
                <button
                  type='button'
                  onClick={showNextImage}
                  className='absolute right-3 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-700 shadow-sm backdrop-blur transition hover:bg-white sm:h-10 sm:w-10'
                  aria-label='Gambar berikutnya'
                >
                  <FiChevronRight className='h-5 w-5' />
                </button>
              </>
            ) : null}
          </div>

          {images.length > 1 ? (
            <div className='flex items-center justify-center gap-2 overflow-x-auto pb-1'>
              {images.map((imageUrl, index) => (
                <button
                  key={`${imageUrl}-${index}`}
                  type='button'
                  onClick={() => setActiveImageIndex(index)}
                  className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition sm:h-20 sm:w-20 ${
                    activeImageIndex === index
                      ? "border-cyan-500 ring-2 ring-cyan-100"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                  aria-label={`Pilih gambar ${index + 1}`}
                >
                  <Image
                    src={imageUrl}
                    alt={`${product.title} thumbnail ${index + 1}`}
                    fill
                    className='object-cover'
                    sizes='80px'
                  />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5'>
          <p className='text-xs font-semibold uppercase tracking-[0.16em] text-slate-500'>
            Detail Produk
          </p>
          <h1 className='mt-2 text-2xl font-semibold leading-tight text-slate-900'>
            {product.title}
          </h1>
          <div className='mt-4 flex flex-wrap items-center gap-2'>
            <p className='text-xl font-bold text-cyan-700 sm:text-2xl'>
              Mulai {displayPrice}
            </p>
            <span className='inline-flex items-center rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700'>
              Min. Order {product.min_order} pcs
            </span>
          </div>

          <div className='mt-5 grid grid-cols-2 rounded-xl border border-slate-200 bg-slate-50 p-1'>
            <button
              type='button'
              onClick={() => setActiveTab("description")}
              className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition sm:text-base ${
                activeTab === "description"
                  ? "bg-white text-cyan-700 shadow-sm ring-1 ring-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FiFileText className='h-4 w-4' />
              Deskripsi
            </button>
            <button
              type='button'
              onClick={() => setActiveTab("detail")}
              className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition sm:text-base ${
                activeTab === "detail"
                  ? "bg-white text-cyan-700 shadow-sm ring-1 ring-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FiInfo className='h-4 w-4' />
              Detail Produk
            </button>
          </div>

          <div className='mt-3 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 sm:p-5 sm:text-base'>
            {activeTab === "description" ? (
              <div className='space-y-3 leading-7 sm:space-y-4'>
                {descriptionParagraphs.length > 0 ? (
                  descriptionParagraphs.map((paragraph, index) => (
                    <p key={`${product.slug}-paragraph-${index}`}>
                      {paragraph}
                    </p>
                  ))
                ) : (
                  <p>Deskripsi produk belum tersedia.</p>
                )}
              </div>
            ) : (
              <div className='divide-y divide-slate-200 rounded-lg border border-slate-100 bg-slate-50'>
                <div className='grid gap-1 p-3 sm:grid-cols-[160px_1fr] sm:gap-3'>
                  <span className='text-sm font-semibold text-slate-900'>
                    Minimum Order
                  </span>
                  <span className='text-sm text-slate-700'>
                    {product.min_order} pcs
                  </span>
                </div>
                <div className='grid gap-1 p-3 sm:grid-cols-[160px_1fr] sm:gap-3'>
                  <span className='text-sm font-semibold text-slate-900'>
                    Pilihan Size
                  </span>
                  <span className='text-sm text-slate-700'>
                    {product.size_options?.length > 0
                      ? product.size_options.join(", ")
                      : "-"}
                  </span>
                </div>
                <div className='grid gap-1 p-3 sm:grid-cols-[160px_1fr] sm:gap-3'>
                  <span className='text-sm font-semibold text-slate-900'>
                    Pilihan Bahan
                  </span>
                  <span className='text-sm text-slate-700'>
                    {product.material_options?.length > 0
                      ? product.material_options.join(", ")
                      : "-"}
                  </span>
                </div>
                <div className='grid gap-1 p-3 sm:grid-cols-[160px_1fr] sm:gap-3'>
                  <span className='text-sm font-semibold text-slate-900'>
                    Kode Produk
                  </span>
                  <span className='text-sm font-medium text-slate-700'>
                    {product.slug}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className='mt-6 flex flex-wrap items-center gap-3'>
            {whatsappNumber ? (
              <WhatsappLeadModalButton
                productSlug={product.slug}
                productTitle={product.title}
                minOrder={product.min_order}
                displayPrice={displayPrice}
                websiteWhatsappNumber={whatsappNumber}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
