import Services from "@/components/shared/home/services";
import Features from "@/components/shared/home/features";
import Hero from "@/components/shared/home/hero";
import HowItWorks from "@/components/shared/home/how-it-works";
import VendorOnboardingSection from "@/components/shared/home/vendor";
import CTA from "@/components/shared/home/cta";
import FAQSection from "@/components/shared/home/faq";
import QuoteConversionSection from "../../components/common/home/quote-services";

export default function Home() {
  return (
    <div className="flex flex-col">
      <Hero />
      <Services />
      <QuoteConversionSection />
      <HowItWorks />

      <VendorOnboardingSection />
      <CTA />
      <FAQSection />
    </div>
  );
}
