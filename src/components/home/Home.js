import { getActiveKitsForHome, getActiveMerchandiseCategories } from "@/actions/catalog";
import { getActiveFaqs } from "@/actions/faq";
import { getTrustedLogos, getWebsiteBranding } from "@/actions/setting";
import { getActiveTestimonials } from "@/actions/testimonial";
import CatalogSection from "./CatalogSection";
import ContactSection from "./ContactSection";
import FooterSection from "./FooterSection";
import FaqSection from "./FaqSection";
import HeroSection from "./HeroSection";
import HomeHeader from "./HomeHeader";
import MerchandiseSection from "./MerchandiseSection";
import ProcessSection from "./ProcessSection";
import TestimonialsSection from "./TestimonialsSection";
import TrustedBySection from "./TrustedBySection";

export default async function Home() {
  const [kits, categories, websiteConfig, trustedLogos, faqs, testimonials] = await Promise.all([
    getActiveKitsForHome(),
    getActiveMerchandiseCategories(),
    getWebsiteBranding(),
    getTrustedLogos(),
    getActiveFaqs(),
    getActiveTestimonials(),
  ]);

  return (
    <main className='overflow-x-hidden bg-white text-slate-900'>
      <HomeHeader websiteConfig={websiteConfig} />
      <HeroSection websiteConfig={websiteConfig} />
      <TrustedBySection logos={trustedLogos} />
      <MerchandiseSection categories={categories} />
      <CatalogSection kits={kits} />
      <ProcessSection />
      <TestimonialsSection testimonials={testimonials} />
      <FaqSection faqs={faqs} />
      <ContactSection />
      <FooterSection websiteConfig={websiteConfig} />
    </main>
  );
}
