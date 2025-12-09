import Services from "@/components/home/services";
import Features from "@/components/home/features";
import Hero from "@/components/home/hero";
import HowItWorks from "@/components/home/how-it-works";
import VendorOnboardingSection from "@/components/home/vendor";
import CTA from "@/components/home/cta";
import FAQSection from "@/components/home/faq";

export default function Home() {
  return (
    <div className="flex flex-col">
      <Hero />
      <Services />
      <HowItWorks />
      <VendorOnboardingSection />
      <CTA />
      <FAQSection />
    </div>
  );
}
