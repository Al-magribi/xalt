"use client";

import { Input, Textarea } from "../ui";
import FileUploadCard from "./FileUploadCard";
import PreviewImage from "./PreviewImage";

export default function HeroSection({
  config,
  heroPreview,
  heroFile,
  onChangeHeroFile,
  onResetHeroFile,
}) {
  const heroSrc = heroPreview || config.hero_image_url;

  return (
    <div className='space-y-4 rounded-xl border border-slate-200 bg-white p-4'>
      <div>
        <h4 className='text-sm font-semibold text-slate-900'>Hero Section</h4>
        <p className='text-xs text-slate-500'>Konten hero di halaman utama.</p>
      </div>

      <div className='grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr,0.9fr]'>
        <div className='space-y-3'>
          <Input label='Hero Title' name='hero_title' defaultValue={config.hero_title} />
          <Textarea
            label='Hero Description'
            name='hero_description'
            defaultValue={config.hero_description}
            rows={4}
          />
          <Textarea
            label='Hero Note'
            name='hero_note'
            defaultValue={config.hero_note}
            rows={2}
          />
        </div>

        <div className='space-y-3'>
          <FileUploadCard
            title='Upload Hero Image'
            hint='Disarankan JPEG/PNG landscape, maksimal 5MB.'
            name='hero_image_file'
            selectedFile={heroFile}
            onChangeFile={onChangeHeroFile}
            onReset={onResetHeroFile}
          />
          <PreviewImage
            title='Preview Hero Image'
            src={heroSrc}
            ratioClass='h-52'
            roundedClass='rounded-xl'
          />
        </div>
      </div>

      <div className='grid grid-cols-1 gap-3 lg:grid-cols-[1fr,1fr]'>
        <Input
          label='Badge Title'
          name='hero_badge_title'
          defaultValue={config.hero_badge_title}
        />
        <Textarea
          label='Badge Text'
          name='hero_badge_text'
          defaultValue={config.hero_badge_text}
          rows={2}
        />
      </div>
    </div>
  );
}
