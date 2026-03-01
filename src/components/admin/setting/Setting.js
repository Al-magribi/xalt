import {
  FiActivity,
  FiDatabase,
  FiGlobe,
  FiLink,
  FiMail,
  FiShield,
} from "react-icons/fi";
import IntegrationSettingPanel from "@/components/admin/setting/IntegrationSettingPanel";
import SeoSettingPanel from "@/components/admin/setting/SeoSettingPanel";
import SmtpSettingPanel from "@/components/admin/setting/SmtpSettingPanel";
import WebsiteSettingPanel from "@/components/admin/setting/WebsiteSettingPanel";

const TAB_ITEMS = [
  {
    id: "website",
    label: "Website",
    icon: FiGlobe,
    description: "Branding dan kontak utama website",
  },
  {
    id: "seo",
    label: "SEO",
    icon: FiActivity,
    description: "Metadata halaman untuk mesin pencari",
  },
  {
    id: "integrations",
    label: "Integrations",
    icon: FiLink,
    description: "Konfigurasi koneksi layanan pihak ketiga",
  },
  {
    id: "smtp",
    label: "SMTP",
    icon: FiMail,
    description: "Konfigurasi email transaksional",
  },
];

export default function Setting({ data, activeTab = "website" }) {
  const websiteConfig = data?.websiteConfig;
  const seoMetadata = Array.isArray(data?.seoMetadata) ? data.seoMetadata : [];
  const apiIntegrations = Array.isArray(data?.apiIntegrations)
    ? data.apiIntegrations
    : [];
  const smtpConfig = data?.smtpConfig;
  const trustedLogos = Array.isArray(data?.trustedLogos) ? data.trustedLogos : [];
  const faqs = Array.isArray(data?.faqs) ? data.faqs : [];
  const testimonials = Array.isArray(data?.testimonials) ? data.testimonials : [];

  return (
    <section className='space-y-5'>
      <article className='rounded-xl border border-slate-200 bg-gradient-to-br from-cyan-50 via-blue-50 to-slate-50 p-4 sm:p-5'>
        <div className='flex flex-wrap items-start justify-between gap-3'>
          <div>
            <p className='text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700'>
              Application Setting
            </p>
            <h2 className='mt-1 font-display text-2xl font-semibold text-slate-900'>
              Pengaturan Aplikasi
            </h2>
          </div>
        </div>
      </article>

      <article className='rounded-xl border border-slate-200 bg-white p-2 sm:p-3'>
        <div className='grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-4'>
          {TAB_ITEMS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <a
                key={tab.id}
                href={`/admin/setting?tab=${tab.id}`}
                className={`rounded-lg border px-3 py-3 transition ${
                  isActive
                    ? "border-blue-200 bg-blue-50 text-blue-700 ring-1 ring-blue-100"
                    : "border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <p className='inline-flex items-center gap-2 text-sm font-semibold'>
                  <Icon className='h-4 w-4' />
                  {tab.label}
                </p>
                <p className='mt-1 text-xs text-slate-500'>{tab.description}</p>
              </a>
            );
          })}
        </div>
      </article>

      {activeTab === "website" && (
        <WebsiteSettingPanel
          config={websiteConfig}
          trustedLogos={trustedLogos}
          faqs={faqs}
          testimonials={testimonials}
        />
      )}
      {activeTab === "seo" && (
        <SeoSettingPanel
          items={seoMetadata}
          faviconUrl={websiteConfig?.favicon_url || ""}
        />
      )}
      {activeTab === "integrations" && (
        <IntegrationSettingPanel items={apiIntegrations} />
      )}
      {activeTab === "smtp" && <SmtpSettingPanel config={smtpConfig} />}
    </section>
  );
}
