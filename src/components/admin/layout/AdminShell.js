"use client";

import { useState } from "react";
import { FiMenu } from "react-icons/fi";
import AdminSidebar from "@/components/admin/layout/AdminSidebar";

export default function AdminShell({ user, menuItems, websiteConfig, title = "Admin", children }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className='min-h-screen bg-slate-100'>
      <div className='mx-auto grid min-h-screen w-full max-w-[1600px] grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)]'>
        <AdminSidebar
          user={user}
          menuItems={menuItems}
          websiteConfig={websiteConfig}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
        />

        <main className='min-w-0 bg-slate-50/70 lg:border-l lg:border-slate-200'>
          <div className='mx-auto w-full max-w-6xl px-4 py-5 md:px-6 md:py-6 lg:px-8'>
            <div className='mb-6 flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-5'>
              <div>
                <h1 className='font-display text-2xl font-semibold text-slate-900'>{title}</h1>
                <p className='mt-1 text-sm text-slate-500'>
                  Kelola data dan monitor performa aplikasi dari satu tempat.
                </p>
              </div>

              <button
                type='button'
                className='inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 lg:hidden'
                onClick={() => setIsOpen(true)}
              >
                <FiMenu className='h-4 w-4' />
                Menu
              </button>
            </div>

            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
