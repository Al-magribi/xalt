"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  addTrustedLogoAction,
  deleteTrustedLogoAction,
  updateTrustedLogoAction,
} from "@/actions/setting";
import { resolveAssetUrl } from "@/utils/media";
import { FormFeedback, INITIAL_STATE, Input, SubmitButton } from "../ui";
import FileUploadCard from "./FileUploadCard";
import PreviewImage from "./PreviewImage";

function TrustedLogoItemCard({ logo }) {
  const router = useRouter();
  const [updateState, updateAction] = useActionState(
    updateTrustedLogoAction,
    INITIAL_STATE,
  );
  const [deleteState, deleteAction] = useActionState(
    deleteTrustedLogoAction,
    INITIAL_STATE,
  );
  const [preview, setPreview] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  useEffect(() => {
    if (!updateState?.ok && !deleteState?.ok) return;
    router.refresh();
  }, [updateState?.ok, deleteState?.ok, router]);

  const previewSrc = preview || resolveAssetUrl(logo.logo_url);

  return (
    <div className='rounded-xl border border-slate-200 bg-slate-50 p-3'>
      <form action={updateAction} className='space-y-3'>
        <input type='hidden' name='trusted_logo_id' value={logo.id} />

        <div className='grid grid-cols-1 gap-3 lg:grid-cols-2'>
          <Input
            label='Brand Name'
            name='trusted_brand_name'
            defaultValue={logo.brand_name}
            required
          />
          <Input
            label='Sort Order'
            name='trusted_sort_order'
            type='number'
            min={0}
            defaultValue={logo.sort_order}
            required
          />
        </div>

        <div className='grid grid-cols-1 gap-3 lg:grid-cols-2'>
          <FileUploadCard
            title='Ganti Logo (Opsional)'
            hint='Kosongkan jika tidak ingin mengganti file.'
            name='trusted_logo_file'
            selectedFile={selectedFile}
            onChangeFile={(file) => {
              if (preview) URL.revokeObjectURL(preview);
              setSelectedFile(file);
              if (!file) {
                setPreview("");
                return;
              }
              setPreview(URL.createObjectURL(file));
            }}
            onReset={() => {
              if (preview) URL.revokeObjectURL(preview);
              setSelectedFile(null);
              setPreview("");
            }}
          />
          <PreviewImage
            title='Preview Logo'
            src={previewSrc}
            ratioClass='h-36'
            roundedClass='rounded-lg'
          />
        </div>

        <label className='inline-flex items-center gap-2 text-sm font-medium text-slate-700'>
          <input
            type='checkbox'
            name='trusted_is_active'
            defaultChecked={logo.is_active}
            value='1'
            className='h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500'
          />
          Tampilkan di homepage
        </label>

        <div className='flex flex-wrap items-center gap-3'>
          <SubmitButton label='Update Logo' />
          <FormFeedback state={updateState} />
        </div>
      </form>

      <form
        action={deleteAction}
        className='mt-3 border-t border-slate-200 pt-3'
      >
        <input type='hidden' name='trusted_logo_id' value={logo.id} />
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <p className='text-xs text-slate-500'>
            Hapus logo akan menghapus record dan file fisik yang tersimpan
            lokal.
          </p>
          <button
            type='submit'
            className='inline-flex items-center rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100'
          >
            Hapus Logo
          </button>
        </div>
        <div className='mt-2'>
          <FormFeedback state={deleteState} />
        </div>
      </form>
    </div>
  );
}

export default function TrustedLogoSection({ trustedLogos = [] }) {
  const router = useRouter();
  const [trustedState, trustedLogoAction] = useActionState(
    addTrustedLogoAction,
    INITIAL_STATE,
  );
  const [trustedLogoPreview, setTrustedLogoPreview] = useState("");
  const [trustedLogoFile, setTrustedLogoFile] = useState(null);

  useEffect(() => {
    return () => {
      if (trustedLogoPreview) URL.revokeObjectURL(trustedLogoPreview);
    };
  }, [trustedLogoPreview]);

  useEffect(() => {
    if (!trustedState?.ok) return;
    if (trustedLogoPreview) URL.revokeObjectURL(trustedLogoPreview);
    setTrustedLogoPreview("");
    setTrustedLogoFile(null);
    router.refresh();
  }, [trustedState, trustedLogoPreview, router]);

  const trustedLogosList = Array.isArray(trustedLogos) ? trustedLogos : [];

  return (
    <div className='space-y-4'>
      <form
        action={trustedLogoAction}
        className='space-y-4 rounded-xl border border-slate-200 bg-white p-4'
      >
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <div>
            <h4 className='text-sm font-semibold text-slate-900'>Trusted Logo</h4>
            <p className='text-xs text-slate-500'>
              Kelola logo brand pada section Trusted By.
            </p>
          </div>
        </div>

        <div className='grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr,0.9fr]'>
          <div className='space-y-3'>
            <Input label='Brand Name' name='trusted_brand_name' required />
            <FileUploadCard
              title='Upload Logo'
              hint='Disarankan PNG/SVG transparan, maksimal 5MB.'
              name='trusted_logo_file'
              selectedFile={trustedLogoFile}
              onChangeFile={(file) => {
                if (trustedLogoPreview) URL.revokeObjectURL(trustedLogoPreview);
                setTrustedLogoFile(file);
                if (!file) {
                  setTrustedLogoPreview("");
                  return;
                }
                setTrustedLogoPreview(URL.createObjectURL(file));
              }}
              onReset={() => {
                if (trustedLogoPreview) URL.revokeObjectURL(trustedLogoPreview);
                setTrustedLogoFile(null);
                setTrustedLogoPreview("");
              }}
            />
          </div>

          <PreviewImage
            title='Preview Logo'
            src={trustedLogoPreview}
            ratioClass='h-40'
            roundedClass='rounded-xl'
          />
        </div>

        <div className='flex flex-wrap items-center gap-3'>
          <SubmitButton label='Tambah Logo' />
          <FormFeedback state={trustedState} />
        </div>
      </form>

      <div className='rounded-xl border border-slate-200 bg-white p-4'>
        <div className='border-b border-slate-200 pb-3'>
          <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
            Daftar Logo
          </p>
        </div>

        {trustedLogosList.length === 0 ? (
          <p className='mt-3 text-sm text-slate-500'>
            Belum ada logo trusted company.
          </p>
        ) : (
          <div className='mt-3 space-y-3'>
            {trustedLogosList.map((logo) => (
              <TrustedLogoItemCard key={logo.id} logo={logo} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
