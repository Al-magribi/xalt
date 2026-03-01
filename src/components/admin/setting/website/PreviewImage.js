"use client";

export default function PreviewImage({
  title,
  src,
  ratioClass = "h-44",
  roundedClass = "rounded-xl",
}) {
  return (
    <div className='rounded-xl border border-slate-200 bg-slate-50 p-3'>
      <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
        {title}
      </p>
      <div
        className={`mt-2 overflow-hidden border border-slate-200 bg-white ${ratioClass} ${roundedClass}`}
      >
        {src ? (
          <img src={src} alt={title} className='h-full w-full object-contain' />
        ) : (
          <div className='flex h-full items-center justify-center text-xs text-slate-400'>
            Belum ada gambar
          </div>
        )}
      </div>
    </div>
  );
}
