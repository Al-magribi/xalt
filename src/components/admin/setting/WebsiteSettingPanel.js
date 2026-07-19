"use client";

import { useActionState, useEffect, useState } from "react";
import { updateWebsiteConfigAction } from "@/actions/setting";
import {
  FiCheckCircle,
  FiHelpCircle,
  FiLayout,
  FiMessageSquare,
  FiSliders,
} from "react-icons/fi";
import {
  FormFeedback,
  formatDateTime,
  INITIAL_STATE,
  SubmitButton,
} from "./ui";
import FaqSection from "./website/FaqSection";
import HeroSection from "./website/HeroSection";
import TestimonialSection from "./website/TestimonialSection";
import TrustedLogoSection from "./website/TrustedLogoSection";
import WebsiteConfigurationSection from "./website/WebsiteConfigurationSection";

const WEBSITE_SUBMENUS = [
  {
    id: "website-config",
    label: "Website Configuration",
    icon: FiSliders,
    description: "Informasi utama website",
  },
  {
    id: "hero-section",
    label: "Hero Section",
    icon: FiLayout,
    description: "Konten hero homepage",
  },
  {
    id: "trusted-logo",
    label: "Trusted Logo",
    icon: FiCheckCircle,
    description: "Logo brand trusted by",
  },
  {
    id: "faq",
    label: "FAQ",
    icon: FiHelpCircle,
    description: "Manajemen pertanyaan umum",
  },
  {
    id: "testimoni",
    label: "Testimoni",
    icon: FiMessageSquare,
    description: "Konten testimoni klien",
  },
];

export default function WebsiteSettingPanel({
  config,
  trustedLogos = [],
  faqs = [],
  testimonials = [],
}) {
  const [state, formAction] = useActionState(
    updateWebsiteConfigAction,
    INITIAL_STATE,
  );
  const [activeSubmenu, setActiveSubmenu] = useState("website-config");
  const [logoPreview, setLogoPreview] = useState("");
  const [faviconPreview, setFaviconPreview] = useState("");
  const [ogImagePreview, setOgImagePreview] = useState("");
  const [heroPreview, setHeroPreview] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [faviconFile, setFaviconFile] = useState(null);
  const [ogImageFile, setOgImageFile] = useState(null);
  const [heroFile, setHeroFile] = useState(null);

  useEffect(() => {
    return () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
      if (faviconPreview) URL.revokeObjectURL(faviconPreview);
      if (ogImagePreview) URL.revokeObjectURL(ogImagePreview);
      if (heroPreview) URL.revokeObjectURL(heroPreview);
    };
  }, [logoPreview, faviconPreview, ogImagePreview, heroPreview]);

  if (!config) {
    return (
      <div className='rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500'>
        Data website config belum tersedia.
      </div>
    );
  }

  const isWebsiteConfigSubmenu = activeSubmenu === "website-config";
  const isHeroSubmenu = activeSubmenu === "hero-section";
  const isTrustedLogoSubmenu = activeSubmenu === "trusted-logo";
  const isFaqSubmenu = activeSubmenu === "faq";
  const isTestimoniSubmenu = activeSubmenu === "testimoni";
  const showWebsiteForm = isWebsiteConfigSubmenu || isHeroSubmenu;

  return (
    <div className='space-y-4'>
      <article className='rounded-xl border border-slate-200 bg-white p-2 sm:p-3'>
        <div className='grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-5'>
          {WEBSITE_SUBMENUS.map((menu) => {
            const Icon = menu.icon;
            const isActive = activeSubmenu === menu.id;
            return (
              <button
                key={menu.id}
                type='button'
                onClick={() => setActiveSubmenu(menu.id)}
                className={`rounded-lg border px-3 py-3 text-left transition ${
                  isActive
                    ? "border-blue-200 bg-blue-50 text-blue-700 ring-1 ring-blue-100"
                    : "border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <p className='inline-flex items-center gap-2 text-sm font-semibold'>
                  <Icon className='h-4 w-4' />
                  {menu.label}
                </p>
                <p className='mt-1 text-xs text-slate-500'>{menu.description}</p>
              </button>
            );
          })}
        </div>
      </article>

      <form
        action={formAction}
        className={showWebsiteForm ? "space-y-4" : "hidden"}
      >
        <div className='flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4'>
          <div>
            <h3 className='text-base font-semibold text-slate-900'>
              Website Settings
            </h3>
            <p className='text-sm text-slate-500'>
              Kelola konfigurasi website per section agar lebih mudah dikelola.
            </p>
          </div>
          <p className='text-xs text-slate-500'>
            Update terakhir: {formatDateTime(config.updated_at)}
          </p>
        </div>

        <div className={isWebsiteConfigSubmenu ? "block" : "hidden"}>
          <WebsiteConfigurationSection
            config={config}
            logoPreview={logoPreview}
            faviconPreview={faviconPreview}
            ogImagePreview={ogImagePreview}
            logoFile={logoFile}
            faviconFile={faviconFile}
            ogImageFile={ogImageFile}
            onChangeLogoFile={(file) => {
              if (logoPreview) URL.revokeObjectURL(logoPreview);
              setLogoFile(file);
              if (!file) {
                setLogoPreview("");
                return;
              }
              setLogoPreview(URL.createObjectURL(file));
            }}
            onResetLogoFile={() => {
              if (logoPreview) URL.revokeObjectURL(logoPreview);
              setLogoFile(null);
              setLogoPreview("");
            }}
            onChangeFaviconFile={(file) => {
              if (faviconPreview) URL.revokeObjectURL(faviconPreview);
              setFaviconFile(file);
              if (!file) {
                setFaviconPreview("");
                return;
              }
              setFaviconPreview(URL.createObjectURL(file));
            }}
            onResetFaviconFile={() => {
              if (faviconPreview) URL.revokeObjectURL(faviconPreview);
              setFaviconFile(null);
              setFaviconPreview("");
            }}
            onChangeOgImageFile={(file) => {
              if (ogImagePreview) URL.revokeObjectURL(ogImagePreview);
              setOgImageFile(file);
              if (!file) {
                setOgImagePreview("");
                return;
              }
              setOgImagePreview(URL.createObjectURL(file));
            }}
            onResetOgImageFile={() => {
              if (ogImagePreview) URL.revokeObjectURL(ogImagePreview);
              setOgImageFile(null);
              setOgImagePreview("");
            }}
          />
        </div>

        <div className={isHeroSubmenu ? "block" : "hidden"}>
          <HeroSection
            config={config}
            heroPreview={heroPreview}
            heroFile={heroFile}
            onChangeHeroFile={(file) => {
              if (heroPreview) URL.revokeObjectURL(heroPreview);
              setHeroFile(file);
              if (!file) {
                setHeroPreview("");
                return;
              }
              setHeroPreview(URL.createObjectURL(file));
            }}
            onResetHeroFile={() => {
              if (heroPreview) URL.revokeObjectURL(heroPreview);
              setHeroFile(null);
              setHeroPreview("");
            }}
          />
        </div>

        <div className='flex flex-wrap items-center gap-3'>
          <SubmitButton />
          <FormFeedback state={state} />
        </div>
      </form>

      {isTrustedLogoSubmenu ? <TrustedLogoSection trustedLogos={trustedLogos} /> : null}
      {isFaqSubmenu ? <FaqSection faqs={faqs} /> : null}
      {isTestimoniSubmenu ? <TestimonialSection testimonials={testimonials} /> : null}
    </div>
  );
}
