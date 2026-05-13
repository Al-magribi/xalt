"use client";

import { useActionState, useEffect, useState } from "react";
import { updateAdminProfileAction } from "@/actions/auth";
import { FiShield, FiUser } from "react-icons/fi";
import {
  FormFeedback,
  INITIAL_STATE,
  SubmitButton,
  formatDateTime,
} from "@/components/admin/setting/ui";

export default function AdminProfile({ profile }) {
  const [state, formAction] = useActionState(
    updateAdminProfileAction,
    INITIAL_STATE,
  );
  const [avatarPreview, setAvatarPreview] = useState("");

  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  if (!profile) {
    return (
      <div className='rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500'>
        Data profil admin tidak ditemukan.
      </div>
    );
  }

  return (
    <section className='space-y-4'>
      <article className='rounded-xl border border-slate-200 bg-gradient-to-br from-cyan-50 via-blue-50 to-slate-50 p-4 sm:p-5'>
        <p className='text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700'>
          Admin Profile
        </p>
        <h2 className='mt-1 font-display text-2xl font-semibold text-slate-900'>
          Profil Admin
        </h2>
        <p className='mt-1 text-sm text-slate-600'>
          Kelola data akun admin dan keamanan login.
        </p>
      </article>

      <div className='grid grid-cols-1 gap-4 xl:grid-cols-[1.4fr_1fr]'>
        <form
          action={formAction}
          encType='multipart/form-data'
          className='space-y-4 rounded-xl border border-slate-200 bg-white p-4'
        >
          <div className='flex items-center gap-2'>
            <FiUser className='h-4 w-4 text-blue-600' />
            <h3 className='text-base font-semibold text-slate-900'>
              Informasi Akun
            </h3>
          </div>

          <label className='block space-y-1'>
            <span className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
              Nama Lengkap
            </span>
            <input
              type='text'
              name='full_name'
              defaultValue={profile.full_name}
              required
              className='w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none ring-blue-200 transition focus:border-blue-400 focus:ring'
            />
          </label>

          <label className='block space-y-1'>
            <span className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
              Email
            </span>
            <input
              type='email'
              name='email'
              defaultValue={profile.email}
              required
              className='w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none ring-blue-200 transition focus:border-blue-400 focus:ring'
            />
          </label>

          <label className='block space-y-1'>
            <span className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
              Nomor Telepon
            </span>
            <input
              type='text'
              name='phone_number'
              defaultValue={profile.phone_number || ""}
              placeholder='Contoh: 628123456789'
              className='w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none ring-blue-200 transition focus:border-blue-400 focus:ring'
            />
          </label>

          <label className='block space-y-1'>
            <span className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
              Upload Avatar
            </span>
            <div className='mb-2 flex items-center gap-3'>
              <div className='h-14 w-14 overflow-hidden rounded-full border border-slate-200 bg-slate-100'>
                {avatarPreview || profile.avatar_url ? (
                  <img
                    src={avatarPreview || profile.avatar_url}
                    alt='Avatar admin'
                    className='h-full w-full object-cover'
                  />
                ) : null}
              </div>
              <p className='text-xs text-slate-500'>
                Format: PNG, maksimal 2MB.
              </p>
            </div>
            <input
              type='file'
              name='avatar_file'
              accept='image/*'
              onChange={(event) => {
                const file = event.currentTarget.files?.[0];
                if (avatarPreview) {
                  URL.revokeObjectURL(avatarPreview);
                }
                if (!file) {
                  setAvatarPreview("");
                  return;
                }
                setAvatarPreview(URL.createObjectURL(file));
              }}
              className='w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none ring-blue-200 transition focus:border-blue-400 focus:ring'
            />
          </label>

          <div className='rounded-lg border border-slate-200 bg-slate-50 p-3'>
            <div className='mb-3 flex items-center gap-2'>
              <FiShield className='h-4 w-4 text-amber-600' />
              <h4 className='text-sm font-semibold text-slate-900'>
                Ubah Password (Opsional)
              </h4>
            </div>
            <div className='grid grid-cols-1 gap-3'>
              <label className='block space-y-1'>
                <span className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                  Password Saat Ini
                </span>
                <input
                  type='password'
                  name='current_password'
                  autoComplete='current-password'
                  className='w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none ring-blue-200 transition focus:border-blue-400 focus:ring'
                />
              </label>
              <label className='block space-y-1'>
                <span className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                  Password Baru
                </span>
                <input
                  type='password'
                  name='new_password'
                  autoComplete='new-password'
                  className='w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none ring-blue-200 transition focus:border-blue-400 focus:ring'
                />
              </label>
              <label className='block space-y-1'>
                <span className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                  Konfirmasi Password Baru
                </span>
                <input
                  type='password'
                  name='confirm_password'
                  autoComplete='new-password'
                  className='w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none ring-blue-200 transition focus:border-blue-400 focus:ring'
                />
              </label>
            </div>
          </div>

          <div className='flex flex-wrap items-center gap-3'>
            <SubmitButton />
            <FormFeedback state={state} />
          </div>
        </form>

        <aside className='space-y-4'>
          <article className='rounded-xl border border-slate-200 bg-white p-4'>
            <h3 className='text-base font-semibold text-slate-900'>
              Ringkasan Profil
            </h3>
            <dl className='mt-3 space-y-3 text-sm'>
              <div>
                <dt className='text-slate-500'>Role</dt>
                <dd className='font-semibold uppercase text-slate-800'>
                  {profile.role}
                </dd>
              </div>
              <div>
                <dt className='text-slate-500'>Status</dt>
                <dd className='font-semibold text-emerald-700'>
                  {profile.is_active ? "Aktif" : "Nonaktif"}
                </dd>
              </div>
              <div>
                <dt className='text-slate-500'>Dibuat</dt>
                <dd className='font-semibold text-slate-800'>
                  {formatDateTime(profile.created_at)}
                </dd>
              </div>
              <div>
                <dt className='text-slate-500'>Update Terakhir</dt>
                <dd className='font-semibold text-slate-800'>
                  {formatDateTime(profile.updated_at)}
                </dd>
              </div>
            </dl>
          </article>
        </aside>
      </div>
    </section>
  );
}
