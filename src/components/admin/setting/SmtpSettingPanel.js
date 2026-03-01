"use client";

import { useActionState } from "react";
import { updateSmtpConfigAction } from "@/actions/setting";
import {
  Checkbox,
  FormFeedback,
  formatDateTime,
  INITIAL_STATE,
  Input,
  StatusBadge,
  SubmitButton,
} from "./ui";

export default function SmtpSettingPanel({ config }) {
  const [state, formAction] = useActionState(updateSmtpConfigAction, INITIAL_STATE);

  if (!config) {
    return (
      <div className='rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500'>
        Data SMTP belum tersedia.
      </div>
    );
  }

  return (
    <form action={formAction} className='space-y-4 rounded-xl border border-slate-200 bg-white p-4'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div>
          <h3 className='text-base font-semibold text-slate-900'>SMTP Configuration</h3>
          <p className='text-sm text-slate-500'>Edit data `settings.smtp_config`.</p>
        </div>
        <StatusBadge active={config.is_active} />
      </div>

      <div className='grid grid-cols-1 gap-3 lg:grid-cols-2'>
        <Input label='Provider' name='provider' defaultValue={config.provider} required />
        <Input label='Host' name='host' defaultValue={config.host} required />
        <Input label='Port' name='port' type='number' defaultValue={String(config.port)} required />
        <label className='block space-y-1'>
          <span className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Encryption</span>
          <select
            name='encryption'
            defaultValue={config.encryption}
            className='w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none ring-blue-200 transition focus:border-blue-400 focus:ring'
          >
            <option value='none'>none</option>
            <option value='ssl'>ssl</option>
            <option value='tls'>tls</option>
          </select>
        </label>
        <Input label='Username' name='username' defaultValue={config.username} />
        <Input label='Password' name='password' defaultValue={config.password} />
        <Input label='From Name' name='from_name' defaultValue={config.from_name} required />
        <Input label='From Email' name='from_email' defaultValue={config.from_email} required />
        <Input label='Reply To Email' name='reply_to_email' defaultValue={config.reply_to_email} />
      </div>

      <div className='flex flex-wrap items-center gap-4'>
        <Checkbox label='Secure Socket' name='secure' defaultChecked={config.secure} />
        <Checkbox label='Aktifkan SMTP' name='is_active' defaultChecked={config.is_active} />
      </div>

      <p className='text-xs text-slate-500'>Update terakhir: {formatDateTime(config.updated_at)}</p>

      <div className='flex flex-wrap items-center gap-3'>
        <SubmitButton />
        <FormFeedback state={state} />
      </div>
    </form>
  );
}
