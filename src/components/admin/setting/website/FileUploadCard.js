"use client";

import { useRef } from "react";
import { FiImage, FiRefreshCcw, FiUploadCloud } from "react-icons/fi";

function formatFileSize(size = 0) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
}

export default function FileUploadCard({
  title,
  hint,
  name,
  accept = "image/*",
  selectedFile,
  onChangeFile,
  onReset,
}) {
  const inputRef = useRef(null);

  return (
    <div className='rounded-xl border border-slate-200 bg-white p-3'>
      <div className='flex items-start justify-between gap-3'>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
            {title}
          </p>
          <p className='mt-1 text-xs text-slate-500'>{hint}</p>
        </div>
        <FiImage className='h-4 w-4 text-slate-400' />
      </div>

      <input
        ref={inputRef}
        type='file'
        name={name}
        accept={accept}
        className='sr-only'
        onChange={(event) => {
          const file = event.target.files?.[0] || null;
          onChangeFile(file);
        }}
      />

      <div className='mt-3 flex flex-wrap items-center gap-2'>
        <button
          type='button'
          className='inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100'
          onClick={() => inputRef.current?.click()}
        >
          <FiUploadCloud className='h-4 w-4' />
          Pilih File
        </button>
        <button
          type='button'
          className='inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50'
          onClick={() => {
            if (inputRef.current) inputRef.current.value = "";
            onReset();
          }}
        >
          <FiRefreshCcw className='h-4 w-4' />
          Reset
        </button>
      </div>

      <div className='mt-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2'>
        {selectedFile ? (
          <div className='space-y-1'>
            <p className='truncate text-sm font-medium text-slate-800'>
              {selectedFile.name}
            </p>
            <p className='text-xs text-slate-500'>
              {selectedFile.type || "image/*"} - {formatFileSize(selectedFile.size)}
            </p>
          </div>
        ) : (
          <p className='text-xs text-slate-500'>
            Belum ada file baru dipilih. File lama tetap dipakai jika tidak
            diubah.
          </p>
        )}
      </div>
    </div>
  );
}
