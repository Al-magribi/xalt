const socialIcons = {
  Instagram: (
    <svg viewBox='0 0 24 24' fill='none' className='h-5 w-5'>
      <rect
        x='3.75'
        y='3.75'
        width='16.5'
        height='16.5'
        rx='4.5'
        stroke='currentColor'
        strokeWidth='1.8'
      />
      <circle cx='12' cy='12' r='4' stroke='currentColor' strokeWidth='1.8' />
      <circle cx='17.2' cy='6.8' r='1.1' fill='currentColor' />
    </svg>
  ),
  LinkedIn: (
    <svg viewBox='0 0 24 24' fill='none' className='h-5 w-5'>
      <path
        d='M7.5 10.5V18m4.5 0v-4.2c0-1.6 1.2-2.6 2.5-2.6s2.5 1 2.5 2.6V18M7.5 7.3a1.3 1.3 0 1 1-2.6 0 1.3 1.3 0 0 1 2.6 0Z'
        stroke='currentColor'
        strokeWidth='1.8'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  ),
  WhatsApp: (
    <svg viewBox='0 0 24 24' fill='none' className='h-5 w-5'>
      <path
        d='M12 21a8.9 8.9 0 0 1-4.2-1l-4 .9.9-3.8A8.9 8.9 0 1 1 12 21Z'
        stroke='currentColor'
        strokeWidth='1.8'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M9 9.2c.2-.4.5-.5.8-.5h.6c.2 0 .4.1.4.3l.7 1.9c.1.2 0 .5-.2.7l-.6.7a6.7 6.7 0 0 0 3 2.9l.7-.6c.2-.2.5-.2.7-.1l1.8.8c.2.1.3.3.3.5v.5c0 .4-.2.8-.6.9-.4.1-.8.2-1.2.2a8.2 8.2 0 0 1-7.9-7.8c0-.4.1-.8.2-1.2.1-.3.3-.5.6-.7Z'
        fill='currentColor'
      />
    </svg>
  ),
  Email: (
    <svg viewBox='0 0 24 24' fill='none' className='h-5 w-5'>
      <rect
        x='3.5'
        y='5.5'
        width='17'
        height='13'
        rx='2'
        stroke='currentColor'
        strokeWidth='1.8'
      />
      <path
        d='m4.5 7 7.5 6L19.5 7'
        stroke='currentColor'
        strokeWidth='1.8'
        strokeLinecap='round'
      />
    </svg>
  ),
};

function toWhatsAppNumber(value) {
  return String(value || "").replace(/[^\d]/g, "");
}

export default function FooterSection({ websiteConfig }) {
  const whatsappNumber = toWhatsAppNumber(websiteConfig?.whatsapp_number);
  const supportEmail = String(websiteConfig?.support_email || "").trim();

  const socialLinks = [
    {
      label: "Instagram",
      href: String(websiteConfig?.instagram_url || "").trim(),
      icon: socialIcons.Instagram,
    },
    {
      label: "LinkedIn",
      href: String(websiteConfig?.linkedin_url || "").trim(),
      icon: socialIcons.LinkedIn,
    },
    {
      label: "WhatsApp",
      href: whatsappNumber ? `https://wa.me/${whatsappNumber}` : "",
      icon: socialIcons.WhatsApp,
    },
    {
      label: "Email",
      href: supportEmail ? `mailto:${supportEmail}` : "",
      icon: socialIcons.Email,
    },
  ].filter((item) => item.href);

  return (
    <footer className='border-t border-slate-200 bg-slate-950 text-slate-100'>
      <div className='mx-auto max-w-7xl px-4 py-10 sm:px-6 md:px-10 md:py-12'>
        <div className='flex flex-col gap-8 md:flex-row md:items-start md:justify-between'>
          <div className='max-w-xl'>
            <p className='inline-flex items-center gap-2.5 font-display text-3xl font-semibold tracking-tight'>
              <span className='inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-900 text-sm font-bold text-white'>
                X
              </span>
              <span>X-ALT</span>
            </p>
            <p className='mt-3 text-sm leading-relaxed text-slate-300 sm:text-base'>
              Corporate merchandise partner untuk kebutuhan onboarding, event,
              dan campaign berskala enterprise.
            </p>
          </div>

          <div>
            <p className='text-sm font-semibold uppercase tracking-wide text-slate-300'>
              Social Media
            </p>
            <div className='mt-4 flex flex-wrap gap-3'>
              {socialLinks.length > 0 ? (
                socialLinks.map((link) => {
                  const isExternal = link.href.startsWith("http://") || link.href.startsWith("https://");
                  return (
                    <a
                      key={link.label}
                      href={link.href}
                      target={isExternal ? "_blank" : undefined}
                      rel={isExternal ? "noreferrer" : undefined}
                      aria-label={link.label}
                      className='inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm font-medium text-slate-100 transition hover:border-slate-500 hover:bg-slate-900'
                    >
                      {link.icon}
                      <span>{link.label}</span>
                    </a>
                  );
                })
              ) : (
                <p className='text-sm text-slate-400'>Social media belum diatur.</p>
              )}
            </div>
          </div>
        </div>

        <div className='mt-8 border-t border-slate-800 pt-4 text-xs text-slate-400 sm:text-sm'>
          <p>&copy; {new Date().getFullYear()} Almadev. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
