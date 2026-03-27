import Link from "next/link";
import Image from "next/image";
import { FaFacebookF, FaInstagram, FaTiktok, FaTwitter } from "react-icons/fa";
import { ArrowRight } from "lucide-react";

const YEAR = new Date().getFullYear();

const SOCIAL = [
  {
    href: "https://www.facebook.com/share/16PPc7nPTk/?mibextid=wwXIfr",
    icon: FaFacebookF,
    label: "Facebook",
  },
  {
    href: "https://www.instagram.com/bookhushly?igsh=ejk1cGo3aGhodTJ0&utm_source=qr",
    icon: FaInstagram,
    label: "Instagram",
  },
  { href: "https://x.com/bookhushly?s=21", icon: FaTwitter, label: "Twitter" },
  {
    href: "https://www.tiktok.com/@bookhushly?_t=ZS-8zHMW0YjmEh&_r=1",
    icon: FaTiktok,
    label: "TikTok",
  },
];

const SERVICES = [
  ["Hotels", "/services?category=hotels"],
  ["Serviced Apartments", "/services?category=serviced_apartments"],
  ["Events", "/services?category=events"],
  ["Car Rentals", "/services?category=car_rentals"],
  ["Logistics", "/services?category=logistics"],
  ["Security", "/services?category=security"],
];

const COMPANY = [
  ["About Us", "/about"],
  ["Blog", "/blog"],
  ["Careers", "/careers"],
  ["Contact", "/contact"],
  ["Terms", "/terms"],
  ["Privacy", "/privacy"],
];

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      {/* ── Top CTA band ── */}
      <div className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h2 className="font-fraunces text-2xl md:text-3xl font-medium text-gray-900 leading-tight mb-1">
              Ready to book something great?
            </h2>
            <p className="text-gray-500 text-sm">
              Hotels, events, logistics, security — all in one place.
            </p>
          </div>
          <Link
            href="/services"
            className="group shrink-0 inline-flex items-center gap-2 h-11 px-6 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-xl transition-colors duration-200"
          >
            Explore services
            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-200" />
          </Link>
        </div>
      </div>

      {/* ── Main grid ── */}
      <div className="max-w-6xl mx-auto px-6 lg:px-10 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand */}
        <div className="lg:col-span-1">
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 mb-5">
            <Image
              src="/logo.png"
              alt="BookHushly"
              fill
              className="object-contain"
            />
          </div>
          <p className="text-sm text-gray-500 leading-relaxed mb-6">
            Connecting Nigeria and Africa with quality hospitality, logistics,
            and security services.
          </p>
          <div className="flex items-center gap-2">
            {SOCIAL.map(({ href, icon: Icon, label }) => (
              <Link
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="h-8 w-8 rounded-lg bg-gray-200 hover:bg-violet-600 flex items-center justify-center text-gray-500 hover:text-white transition-all duration-150 text-xs"
              >
                <Icon />
              </Link>
            ))}
          </div>
        </div>

        {/* Services */}
        <div>
          <h4 className="text-xs font-medium uppercase tracking-[0.15em] text-gray-400 mb-4">
            Services
          </h4>
          <ul className="space-y-2.5">
            {SERVICES.map(([label, href]) => (
              <li key={href}>
                <Link
                  href={href}
                  className="text-sm text-gray-500 hover:text-gray-900 transition-colors duration-150"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4 className="text-xs font-medium uppercase tracking-[0.15em] text-gray-400 mb-4">
            Company
          </h4>
          <ul className="space-y-2.5">
            {COMPANY.map(([label, href]) => (
              <li key={href}>
                <Link
                  href={href}
                  className="text-sm text-gray-500 hover:text-gray-900 transition-colors duration-150"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-xs font-medium uppercase tracking-[0.15em] text-gray-400 mb-4">
            Get in touch
          </h4>
          <p className="text-sm text-gray-500 leading-relaxed mb-5">
            Have a question or need a custom quote? We respond fast.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-violet-600 hover:text-violet-700 transition-colors"
          >
            Contact us <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-[11px] text-gray-400 leading-relaxed">
              BookHushly is part of{" "}
              <span className="text-gray-600 font-medium">
                Longman Vicky &amp; Co Ltd
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-gray-400">
            © {YEAR} BookHushly. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            {[
              ["Terms", "/terms"],
              ["Privacy", "/privacy"],
            ].map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
