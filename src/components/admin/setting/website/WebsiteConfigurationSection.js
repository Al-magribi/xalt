"use client";

import { Input, Textarea } from "../ui";
import FileUploadCard from "./FileUploadCard";
import PreviewImage from "./PreviewImage";

export default function WebsiteConfigurationSection({
  config,
  logoPreview,
  faviconPreview,
  logoFile,
  faviconFile,
  onChangeLogoFile,
  onResetLogoFile,
  onChangeFaviconFile,
  onResetFaviconFile,
}) {
  const logoSrc = logoPreview || config.logo_url;
  const faviconSrc = faviconPreview || config.favicon_url;

  return (
    <div className='space-y-4 rounded-xl border border-slate-200 bg-white p-4'>
      <div>
        <h4 className='text-sm font-semibold text-slate-900'>
          Website Configuration
        </h4>
        <p className='text-xs text-slate-500'>
          Pengaturan informasi utama website.
        </p>
      </div>

      <div className='grid grid-cols-1 gap-3 lg:grid-cols-2'>
        <Input label='Site Name' name='site_name' defaultValue={config.site_name} required />
        <Input
          label='Default Language'
          name='default_language'
          defaultValue={config.default_language}
          required
        />
        <Input
          label='App URL'
          name='app_url'
          defaultValue={config.app_url}
          placeholder='https://xaltcorp.com'
        />
        <Input
          label='Support Email'
          name='support_email'
          defaultValue={config.support_email}
        />
        <Input
          label='Support Phone'
          name='support_phone'
          defaultValue={config.support_phone}
        />
        <Input
          label='Whatsapp Number'
          name='whatsapp_number'
          defaultValue={config.whatsapp_number}
        />
        <Input
          label='Instagram URL'
          name='instagram_url'
          defaultValue={config.instagram_url}
          placeholder='https://instagram.com/yourbrand'
        />
        <Input
          label='LinkedIn URL'
          name='linkedin_url'
          defaultValue={config.linkedin_url}
          placeholder='https://linkedin.com/company/yourbrand'
        />
      </div>

      <Textarea
        label='Site Tagline'
        name='site_tagline'
        defaultValue={config.site_tagline}
        rows={2}
      />

      <div className='border-t border-slate-200 pt-4'>
        <h5 className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
          Company Logo
        </h5>
        <p className='mt-1 text-xs text-slate-500'>
          Kelola logo utama dan favicon website.
        </p>
      </div>

      <div className='grid grid-cols-1 gap-3 lg:grid-cols-2'>
        <FileUploadCard
          title='Upload Logo'
          hint='Disarankan PNG/SVG transparan, maksimal 5MB.'
          name='logo_file'
          selectedFile={logoFile}
          onChangeFile={onChangeLogoFile}
          onReset={onResetLogoFile}
        />
        <FileUploadCard
          title='Upload Favicon'
          hint='Disarankan PNG/ICO rasio 1:1, maksimal 5MB.'
          name='favicon_file'
          selectedFile={faviconFile}
          onChangeFile={onChangeFaviconFile}
          onReset={onResetFaviconFile}
        />
      </div>

      <div className='grid grid-cols-1 gap-3 lg:grid-cols-2'>
        <PreviewImage
          title='Preview Logo'
          src={logoSrc}
          ratioClass='h-44'
          roundedClass='rounded-xl'
        />
        <PreviewImage
          title='Preview Favicon'
          src={faviconSrc}
          ratioClass='h-44'
          roundedClass='rounded-xl'
        />
      </div>
    </div>
  );
}
