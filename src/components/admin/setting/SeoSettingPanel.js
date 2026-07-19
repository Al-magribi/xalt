"use client";

import { useActionState } from "react";
import { updateSeoMetadataAction } from "@/actions/setting";
import {
  Checkbox,
  FormFeedback,
  formatDateTime,
  INITIAL_STATE,
  Input,
  StatusBadge,
  SubmitButton,
  Textarea,
} from "./ui";

function SeoItemForm({ item }) {
  const [state, formAction] = useActionState(updateSeoMetadataAction, INITIAL_STATE);

  return (
    <form action={formAction} className='space-y-3 rounded-xl border border-slate-200 bg-white p-4'>
      <input type='hidden' name='id' value={item.id} />

      <div className='flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-3'>
        <div>
          <p className='text-base font-semibold text-slate-900'>{item.page_key}</p>
          <p className='text-xs text-slate-500'>Updated: {formatDateTime(item.updated_at)}</p>
        </div>
        <div className='flex items-center gap-2'>
          <StatusBadge active={item.robots_index} trueLabel='Index ON' falseLabel='Index OFF' />
          <StatusBadge active={item.robots_follow} trueLabel='Follow ON' falseLabel='Follow OFF' />
        </div>
      </div>

      <div className='grid grid-cols-1 gap-3 lg:grid-cols-2'>
        <Input label='Page Path' name='page_path' defaultValue={item.page_path} required />
        <Input label='Canonical URL' name='canonical_url' defaultValue={item.canonical_url} />
        <Input label='Meta Title' name='meta_title' defaultValue={item.meta_title} required />
        <Input label='OG Title' name='og_title' defaultValue={item.og_title} />
        <Input label='OG Type' name='og_type' defaultValue={item.og_type} />
        <Input label='OG Image URL' name='og_image_url' defaultValue={item.og_image_url} />
        <Input label='Twitter Card' name='twitter_card' defaultValue={item.twitter_card} />
        <Input label='Twitter Title' name='twitter_title' defaultValue={item.twitter_title} />
        <Input label='Twitter Image URL' name='twitter_image_url' defaultValue={item.twitter_image_url} />
      </div>

      <Textarea label='Meta Description' name='meta_description' defaultValue={item.meta_description} required rows={3} />
      <Textarea label='OG Description' name='og_description' defaultValue={item.og_description} rows={2} />
      <Textarea label='Twitter Description' name='twitter_description' defaultValue={item.twitter_description} rows={2} />
      <Textarea
        label='Meta Keywords (pisahkan koma)'
        name='meta_keywords'
        defaultValue={(item.meta_keywords || []).join(", ")}
        rows={2}
      />

      <div className='flex flex-wrap items-center gap-4'>
        <Checkbox label='Robots Index' name='robots_index' defaultChecked={item.robots_index} />
        <Checkbox label='Robots Follow' name='robots_follow' defaultChecked={item.robots_follow} />
      </div>

      <div className='flex flex-wrap items-center gap-3'>
        <SubmitButton />
        <FormFeedback state={state} />
      </div>
    </form>
  );
}

export default function SeoSettingPanel({ items }) {
  return (
    <section className='space-y-4'>
      <div className='rounded-xl border border-slate-200 bg-white p-4'>
        <h3 className='text-base font-semibold text-slate-900'>SEO Metadata ({items.length})</h3>
        <p className='text-sm text-slate-500'>
          Edit data `settings.seo_metadata` per halaman. Untuk gambar share utama, upload OG Image di Website Configuration.
        </p>
      </div>

      {items.length === 0 ? (
        <div className='rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500'>
          Belum ada metadata SEO.
        </div>
      ) : (
        <div className='space-y-4'>
          {items.map((item) => (
            <SeoItemForm key={item.id} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}
