import "./globals.css";
import { Bricolage_Grotesque, Fraunces } from "next/font/google";
import QueryProvider from "@/components/common/QueryProvider";
import { Analytics } from "@vercel/analytics/next";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["SOFT", "WONK"],
});

export const metadata = {
  metadataBase: new URL("https://bookhushly.com"),
  title: {
    template: "%s | BookHushly",
    default: "BookHushly — Book Hotels, Apartments & Services in Nigeria",
  },
  description:
    "Nigeria's #1 platform to book hotels, serviced apartments, events, logistics and security services. Instant booking. Verified vendors. Best prices.",
  keywords: [
    "hotel booking Nigeria",
    "serviced apartments Nigeria",
    "book hotel Lagos",
    "book hotel Abuja",
    "logistics Nigeria",
    "security services Nigeria",
    "short let apartments Lagos",
    "Nigerian hospitality platform",
    "BookHushly",
    "bookhushly",
  ],
  authors: [{ name: "BookHushly", url: "https://bookhushly.com" }],
  creator: "BookHushly",
  publisher: "BookHushly",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: "https://bookhushly.com",
    siteName: "BookHushly",
    title: "BookHushly — Book Hotels, Apartments & Services in Nigeria",
    description:
      "Nigeria's #1 platform to book hotels, serviced apartments, events, logistics and security services.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "BookHushly — Nigeria's Hospitality Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@bookhushly",
    creator: "@bookhushly",
    title: "BookHushly — Book Hotels, Apartments & Services in Nigeria",
    description:
      "Nigeria's #1 platform to book hotels, serviced apartments, events, logistics and security services.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png" }],
    other: [
      { rel: "mask-icon", url: "/safari-pinned-tab.svg", color: "#7c3aed" },
    ],
  },
  manifest: "/site.webmanifest",
  alternates: {
    canonical: "https://bookhushly.com",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en-NG" className={`${bricolage.variable} ${fraunces.variable}`}>
      <head>
        <meta
          name="google-site-verification"
          content="uANXuzlLeRmlzRWo1cKSGdPQKpS80dSIHWImy2hQ9rM"
        />
      </head>
      <body className="font-bricolage antialiased">
        <QueryProvider>{children}</QueryProvider>
        <Analytics />
      </body>
    </html>
  );
}
