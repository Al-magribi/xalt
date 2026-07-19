"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { navItems } from "./homeData";
import { resolveAssetUrl } from "@/utils/media";

export default function HomeHeader({ websiteConfig }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const siteName = websiteConfig?.site_name || "X-ALT";
  const faviconUrl = resolveAssetUrl(websiteConfig?.favicon_url);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);
  const getNavHref = (href) => {
    if (href.startsWith("/") || href.startsWith("http")) return href;
    return isHomePage ? href : `/${href}`;
  };

  return (
    <header className='sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur'>
      <div className='mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:h-20 sm:px-6 md:px-10'>
        <div className='flex items-center gap-4'>
          <button
            type='button'
            aria-label={isMobileMenuOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className='inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 text-slate-700 transition hover:border-slate-400 hover:text-slate-900 md:hidden'
          >
            <svg viewBox='0 0 24 24' fill='none' className='h-6 w-6'>
              {isMobileMenuOpen ? (
                <path
                  d='m6 6 12 12M18 6 6 18'
                  stroke='currentColor'
                  strokeWidth='1.8'
                  strokeLinecap='round'
                />
              ) : (
                <path
                  d='M4 7h16M4 12h16M4 17h16'
                  stroke='currentColor'
                  strokeWidth='1.8'
                  strokeLinecap='round'
                />
              )}
            </svg>
          </button>
          <Link
            href='/'
            className='inline-flex items-center gap-2.5 font-display text-2xl font-semibold tracking-tight sm:text-3xl'
          >
            {faviconUrl ? (
              <img
                src={faviconUrl}
                alt={`${siteName} icon`}
                className='h-8 w-8 rounded-lg border border-slate-200 object-cover sm:h-9 sm:w-9'
              />
            ) : (
              <span className='inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-900 text-sm font-bold text-white sm:h-9 sm:w-9'>
                {siteName.charAt(0).toUpperCase()}
              </span>
            )}
            <span>{siteName}</span>
          </Link>
        </div>

        <nav className='hidden items-center gap-6 text-sm font-medium text-slate-700 lg:flex'>
          {navItems.map((nav) => (
            <Link
              key={nav.href}
              href={getNavHref(nav.href)}
              className='transition hover:text-blue-900'
            >
              {nav.label}
            </Link>
          ))}
          {/* <Link className='transition hover:text-blue-900' href='/order'>
            Cek Pesanan
          </Link> */}
        </nav>

        <Link
          href='/download-katalog'
          className='hidden rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800 md:inline-flex'
        >
          Download Katalog
        </Link>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className='overflow-hidden border-t border-slate-200 bg-white md:hidden'
          >
            <div className='mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 sm:px-6'>
              {navItems.map((nav) => (
                <Link
                  key={nav.href}
                  href={getNavHref(nav.href)}
                  onClick={closeMobileMenu}
                  className='rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-blue-900'
                >
                  {nav.label}
                </Link>
              ))}
              <Link
                href='/download-katalog'
                onClick={closeMobileMenu}
                className='mt-2 inline-flex justify-center rounded-lg bg-blue-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-800'
              >
                Download Katalog
              </Link>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
