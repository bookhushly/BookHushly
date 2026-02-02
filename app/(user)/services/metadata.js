// app/services/metadata.js
import { SCATEGORIES } from "@/lib/constants";

export function generateMetadata({ searchParams }) {
  const category = searchParams?.category || SCATEGORIES[0].value;
  const categoryData = SCATEGORIES.find((c) => c.value === category);

  if (!categoryData) {
    return {
      title: "Services | BookHushly",
      description: "Browse and book quality services across Nigeria",
    };
  }

  const title = `${categoryData.label} in Nigeria | BookHushly`;
  const description = `Find and book the best ${categoryData.label.toLowerCase()} services in Nigeria. Verified providers, instant booking, secure payments. Browse hotels, apartments, events, logistics & security services.`;

  return {
    title,
    description,
    keywords: [
      categoryData.label,
      "Nigeria",
      "booking",
      "services",
      "BookHushly",
      "Lagos",
      "Abuja",
      "Port Harcourt",
      categoryData.label.toLowerCase(),
      `${categoryData.label.toLowerCase()} booking`,
      `${categoryData.label.toLowerCase()} Nigeria`,
    ].join(", "),
    openGraph: {
      title,
      description,
      url: `https://bookhushly.com/services?category=${category}`,
      siteName: "BookHushly",
      images: [
        {
          url: categoryData.image,
          width: 1200,
          height: 630,
          alt: categoryData.alt,
        },
      ],
      locale: "en_NG",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [categoryData.image],
    },
    alternates: {
      canonical: `https://bookhushly.com/services?category=${category}`,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}
