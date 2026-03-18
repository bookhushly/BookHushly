import Services from "@/components/shared/home/services";
import Features from "@/components/shared/home/features";
import Hero from "@/components/shared/home/hero";
import HowItWorks from "@/components/shared/home/how-it-works";
import VendorOnboardingSection from "@/components/shared/home/vendor";
import CTA from "@/components/shared/home/cta";
import FAQSection from "@/components/shared/home/faq";
import QuoteConversionSection from "../../components/common/home/quote-services";
import NearbyListings from "@/components/shared/home/nearby-listings";

export const metadata = {
  title: "BookHushly — Book Hotels, Apartments & Services in Nigeria",
  description:
    "Nigeria's #1 platform to book hotels, serviced apartments, events, logistics and security services. Instant booking. Verified vendors. Best prices across Lagos, Abuja, Port Harcourt and more.",
  keywords: [
    "hotel booking Nigeria",
    "book hotel Lagos",
    "book hotel Abuja",
    "serviced apartments Nigeria",
    "short let Lagos",
    "event booking Nigeria",
    "logistics Nigeria",
    "security services Nigeria",
    "hospitality platform Nigeria",
    "BookHushly",
  ],
  alternates: { canonical: "https://bookhushly.com" },
  openGraph: {
    title: "BookHushly — Book Hotels, Apartments & Services in Nigeria",
    description:
      "Nigeria's #1 platform to book hotels, serviced apartments, events, logistics and security services.",
    url: "https://bookhushly.com",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "BookHushly" }],
  },
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "BookHushly",
  url: "https://bookhushly.com",
  description:
    "Nigeria's #1 platform to book hotels, serviced apartments, events, logistics and security services.",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://bookhushly.com/search?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "BookHushly",
  url: "https://bookhushly.com",
  logo: "https://bookhushly.com/logo.png",
  description:
    "Nigeria's leading hospitality and services booking platform connecting travelers with verified hotels, apartments, events, logistics and security providers.",
  address: {
    "@type": "PostalAddress",
    addressCountry: "NG",
    addressLocality: "Lagos",
  },
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    url: "https://bookhushly.com/contact",
    availableLanguage: "English",
  },
  sameAs: [
    "https://twitter.com/bookhushly",
    "https://www.instagram.com/bookhushly",
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema).replace(/</g, "\\u003c"),
        }}
      />
      <div className="flex flex-col">
        <Hero />
        <NearbyListings />
        <Services />
        <QuoteConversionSection />
        <HowItWorks />
        <VendorOnboardingSection />
        <CTA />
        <FAQSection />
      </div>
    </>
  );
}
