"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/actions/auth";
import { FiChevronRight, FiGrid, FiLayout, FiLogOut, FiX } from "react-icons/fi";

function normalizeHref(href) {
  if (!href) return "/admin/dashboard";
  if (href.startsWith("/")) return href;
  if (href.startsWith("#")) return `/admin/dashboard${href}`;
  return href;
}

function isActivePath(pathname, href) {
  if (!pathname || !href) return false;
  if (href === pathname) return true;
  return href !== "/" && pathname.startsWith(`${href}/`);
}

export default function AdminSidebar({ user, menuItems, websiteConfig, isOpen, onClose }) {
  const pathname = usePathname();
  const name = user?.full_name || user?.email || "Admin";
  const siteName = websiteConfig?.site_name || "X-ALT";
  const faviconUrl = websiteConfig?.favicon_url || "";
  const siteTagline = websiteConfig?.site_tagline || "Management Console";

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-slate-950/35 transition-opacity lg:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden='true'
      />

      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-[280px] -translate-x-full border-r border-slate-200 bg-white p-4 shadow-2xl transition-transform duration-200 lg:sticky lg:top-0 lg:flex lg:h-screen lg:translate-x-0 lg:flex-col lg:shadow-none ${
          isOpen ? "translate-x-0" : ""
        }`}
      >
        <div className='mb-6 flex items-center justify-between gap-3'>
          <div className='min-w-0'>
            <div className='inline-flex items-center gap-2'>
              <div className='inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm'>
                {faviconUrl ? (
                  <img src={faviconUrl} alt={`${siteName} icon`} className='h-full w-full object-cover' />
                ) : (
                  <span className='text-sm font-bold text-slate-700'>{siteName.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className='min-w-0'>
                <p className='truncate font-display text-base font-semibold text-slate-900'>{siteName}</p>
                <p className='truncate text-[11px] uppercase tracking-wide text-slate-500'>Admin Console</p>
              </div>
            </div>
            <p className='mt-2 truncate text-xs text-slate-500'>{siteTagline}</p>
          </div>
          <button
            type='button'
            className='rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden'
            onClick={onClose}
            aria-label='Close menu'
          >
            <FiX className='h-5 w-5' />
          </button>
        </div>

        <div className='mb-5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3'>
          <p className='text-[11px] uppercase tracking-wide text-slate-500'>Signed in as</p>
          <p className='mt-1 truncate text-sm font-semibold text-slate-900'>{name}</p>
        </div>

        <nav className='space-y-1 overflow-y-auto pr-1'>
          <Link
            href='/admin/dashboard'
            className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              pathname === "/admin/dashboard"
                ? "bg-blue-50 text-blue-700 ring-1 ring-blue-100"
                : "text-slate-700 hover:bg-slate-100"
            }`}
            onClick={onClose}
          >
            <span className='flex items-center gap-2'>
              <FiGrid className='h-4 w-4' />
              Overview
            </span>
            <FiChevronRight className='h-4 w-4' />
          </Link>

          {menuItems.map((item) => {
            const href = normalizeHref(item.href);
            const active = isActivePath(pathname, href);
            return (
              <Link
                key={item.id}
                href={href}
                className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-blue-50 font-semibold text-blue-700 ring-1 ring-blue-100"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
                onClick={onClose}
              >
                <span className='flex items-center gap-2'>
                  <FiLayout className={`h-4 w-4 ${active ? "text-blue-600" : "text-slate-500"}`} />
                  {item.label}
                </span>
                <FiChevronRight className={`h-4 w-4 ${active ? "text-blue-500" : "text-slate-400"}`} />
              </Link>
            );
          })}
        </nav>

        <form action={logoutAction} className='mt-6 border-t border-slate-200 pt-4'>
          <button
            type='submit'
            className='flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-50'
          >
            <span className='flex items-center gap-2'>
              <FiLogOut className='h-4 w-4' />
              Logout
            </span>
            <FiChevronRight className='h-4 w-4 text-rose-500' />
          </button>
        </form>
      </aside>
    </>
  );
}
