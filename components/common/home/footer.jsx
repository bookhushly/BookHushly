"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaFacebookF, FaInstagram, FaTiktok, FaTwitter } from "react-icons/fa";
import { ArrowRight, ChevronDown } from "lucide-react";

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

function AccordionSection({ title, children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="sm:contents">
      {/* Mobile: collapsible header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="sm:hidden w-full flex items-center justify-between py-4 border-b border-gray-200 text-left"
      >
        <span className="text-xs font-medium uppercase tracking-[0.15em] text-gray-400">
          {title}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Mobile: collapsible body */}
      <div className={`sm:hidden overflow-hidden transition-all duration-200 ${open ? "max-h-96 pb-4" : "max-h-0"}`}>
        <div className="pt-3">{children}</div>
      </div>

      {/* Desktop: always visible */}
      <div className="hidden sm:block">
        <h4 className="text-xs font-medium uppercase tracking-[0.15em] text-gray-400 mb-4">
          {title}
        </h4>
        {children}
      </div>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      {/* ── Top CTA band ── */}
      <div className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
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
      <div className="max-w-6xl mx-auto px-6 lg:px-10 py-10 sm:py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 sm:gap-10">
        {/* Brand — always visible */}
        <div className="lg:col-span-1 pb-6 sm:pb-0 border-b sm:border-b-0 border-gray-200">
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 mb-1">
            <Image
              src="/logo.png"
              alt="BookHushly"
              fill
              className="object-contain"
            />
          </div>
          <p className="text-sm text-gray-500 leading-relaxed mb-5">
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
        <AccordionSection title="Services">
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
        </AccordionSection>

        {/* Company */}
        <AccordionSection title="Company">
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
        </AccordionSection>

        {/* Contact */}
        <AccordionSection title="Get in touch">
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
        </AccordionSection>
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
