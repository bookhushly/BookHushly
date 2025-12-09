"use client";

import React from "react";
import Link from "next/link";
import { FaFacebookF, FaInstagram, FaTiktok, FaTwitter } from "react-icons/fa";

const currentYear = new Date().getFullYear();

const socialLinks = [
  {
    href: "https://www.facebook.com/share/16PPc7nPTk/?mibextid=wwXIfr",
    icon: <FaFacebookF />,
    label: "Facebook",
  },
  {
    href: "https://www.instagram.com/bookhushly?igsh=ejk1cGo3aGhodTJ0&utm_source=qr",
    icon: <FaInstagram />,
    label: "Instagram",
  },
  {
    href: "https://x.com/bookhushly?s=21",
    icon: <FaTwitter />,
    label: "Twitter",
  },
  {
    href: "https://www.tiktok.com/@bookhushly?_t=ZS-8zHMW0YjmEh&_r=1",
    icon: <FaTiktok />,
    label: "TikTok",
  },
];

const serviceLinks = [
  ["Hotels", "/services?category=hotels"],
  ["Serviced Apartments", "/services?category=serviced_apartments"],
  ["Food & Restaurants", "/services?category=food"],
  ["Events", "/services?category=events"],
  ["Car Rentals", "/services?category=car_rentals"],
  ["Logistics", "/services?category=logistics"],
  ["Security", "/services?category=security"],
];

const companyLinks = [
  ["About Us", "/about"],
  ["Careers", "/careers"],
  ["Blog", "/blog"],
  ["Contact", "/contact"],
  ["Terms", "/terms"],
  ["Privacy", "/privacy"],
];

/* ----------------------
   2. Bento Grid Footer
   ----------------------*/
export function FooterBentoGrid() {
  return (
    <footer className="bg-gradient-to-b from-[#2b0450] to-[#160224] text-white py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Brand Card */}
          <div className="bg-white/5 rounded-xl p-6 shadow-md flex flex-col justify-between">
            <div>
              <h3 className="text-2xl font-semibold">Bookhushly</h3>
              <p className="mt-3 text-sm text-purple-100 leading-relaxed">
                Connecting Nigeria and Africa with quality hospitality,
                logistics, and security services. Your trusted platform for
                premium bookings.
              </p>
            </div>
            <div className="mt-6 flex gap-3">
              {socialLinks.map((s, i) => (
                <Link
                  key={i}
                  href={s.href}
                  target="_blank"
                  className="w-10 h-10 rounded-lg bg-white/6 flex items-center justify-center hover:scale-105 transition"
                >
                  {s.icon}
                </Link>
              ))}
            </div>
          </div>

          {/* Services Card */}
          <div className="bg-white/3 rounded-xl p-6 shadow-md">
            <h4 className="text-lg font-medium mb-3">Services</h4>
            <ul className="grid grid-cols-2 gap-2 text-sm text-purple-100">
              {serviceLinks.map(([label, href]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="block hover:text-white transition"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Card */}
          <div className="bg-white/3 rounded-xl p-6 shadow-md">
            <h4 className="text-lg font-medium mb-3">Company</h4>
            <ul className="space-y-2 text-sm text-purple-100">
              {companyLinks.map(([label, href]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="block hover:text-white transition"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact CTA Card */}
          <div className="bg-gradient-to-tr from-[#6d2cff] to-[#4b1acb] rounded-xl p-6 shadow-lg">
            <h4 className="text-xl font-semibold">Let's get you booked</h4>
            <p className="mt-2 text-sm text-white/90">
              Find hotels, restaurants, cars and more across Africa.
            </p>
            <div className="mt-4">
              <Link
                href="/contact"
                className="inline-block px-4 py-2 bg-white text-purple-800 rounded-md font-medium shadow-sm hover:opacity-95"
              >
                Contact Us
              </Link>
            </div>
          </div>

          {/* Empty / Placeholder Certifications */}
          <div className="bg-white/5 rounded-xl p-6 shadow-md">
            <h4 className="text-lg font-medium mb-3">Partners</h4>
            <p className="text-sm text-purple-100">Longman Vicky & Co Ltd</p>
          </div>

          {/* Quick Links / Small */}
          <div className="bg-white/5 rounded-xl p-6 shadow-md">
            <h4 className="text-lg font-medium mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm text-purple-100">
              <li>
                <Link href="/blog" className="hover:text-white">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white">
                  Privacy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-6 text-sm text-center text-purple-200">
          © {currentYear} Bookhushly. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

/* ----------------------
   4. Split-Screen Footer
   ----------------------*/
export function FooterSplitScreen() {
  return (
    <footer className="bg-[#12021f] text-white py-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left */}
          <div>
            <h2 className="text-3xl font-bold">Bookhushly</h2>
            <p className="mt-4 text-purple-200 leading-relaxed">
              Connecting Nigeria and Africa with quality hospitality, logistics,
              and security services. Your trusted platform for premium bookings.
            </p>
            <div className="mt-6 flex gap-3">
              {socialLinks.map((s, i) => (
                <Link
                  key={i}
                  href={s.href}
                  target="_blank"
                  className="w-11 h-11 rounded-full bg-white/5 flex items-center justify-center hover:bg-purple-600 transition"
                >
                  {s.icon}
                </Link>
              ))}
            </div>
          </div>

          {/* Right */}
          <div className="flex gap-8">
            <div>
              <h4 className="font-medium mb-3">Services</h4>
              <ul className="space-y-2 text-sm text-purple-100">
                {serviceLinks.map(([label, href]) => (
                  <li key={href}>
                    <Link href={href} className="hover:text-white">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-purple-100">
                {companyLinks.map(([label, href]) => (
                  <li key={href}>
                    <Link href={href} className="hover:text-white">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 text-center text-sm text-purple-200">
          Bookhushly is part of <strong>Longman Vicky & Co Ltd</strong>. ©{" "}
          {currentYear} Bookhushly.
        </div>
      </div>
    </footer>
  );
}

/* ----------------------
   5. Ultra-Modern Sidebar Footer
   ----------------------*/
export function FooterSidebar() {
  return (
    <footer className="bg-gradient-to-b from-[#1a0426] to-[#0b0212] text-white py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="md:w-1/4 flex items-start">
            <div className="w-3 bg-purple-500 rounded-full mr-4" />
            <div>
              <h3 className="text-2xl font-semibold">Bookhushly</h3>
              <p className="mt-2 text-sm text-purple-200">
                Connecting Nigeria and Africa with quality hospitality,
                logistics, and security services.
              </p>
              <div className="mt-4 flex gap-3">
                {socialLinks.map((s, i) => (
                  <Link
                    key={i}
                    href={s.href}
                    target="_blank"
                    className="w-9 h-9 rounded-md bg-white/5 flex items-center justify-center"
                  >
                    {s.icon}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Main cols */}
          <div className="md:flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h5 className="font-medium mb-3">Services</h5>
              <ul className="space-y-2 text-sm text-purple-100">
                {serviceLinks.map(([label, href]) => (
                  <li key={href}>
                    <Link href={href} className="hover:text-white">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="font-medium mb-3">Company</h5>
              <ul className="space-y-2 text-sm text-purple-100">
                {companyLinks.map(([label, href]) => (
                  <li key={href}>
                    <Link href={href} className="hover:text-white">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="font-medium mb-3">About</h5>
              <p className="text-sm text-purple-200">
                Bookhushly is part of <strong>Longman Vicky & Co Ltd</strong> —
                leader in hospitality across Nigeria & Africa.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-center text-sm text-purple-200">
          © {currentYear} Bookhushly. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

/* ----------------------
   6. Card-Stack Footer
   ----------------------*/
export function FooterCardStack() {
  return (
    <footer className="bg-[#0f0313] text-white py-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-start">
          <div className="md:w-1/3 bg-white/5 rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold">Bookhushly</h3>
            <p className="mt-3 text-sm text-purple-100">
              Connecting Nigeria and Africa with quality hospitality, logistics,
              and security services.
            </p>
            <div className="mt-4 flex gap-3">
              {socialLinks.map((s, i) => (
                <Link
                  key={i}
                  href={s.href}
                  target="_blank"
                  className="w-9 h-9 rounded-full bg-white/6 flex items-center justify-center"
                >
                  {s.icon}
                </Link>
              ))}
            </div>
          </div>

          <div className="md:flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white/3 rounded-xl p-6 shadow-md">
              <h4 className="font-medium mb-3">Services</h4>
              <ul className="space-y-2 text-sm text-purple-100">
                {serviceLinks.map(([label, href]) => (
                  <li key={href}>
                    <Link href={href} className="hover:text-white">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white/3 rounded-xl p-6 shadow-md">
              <h4 className="font-medium mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-purple-100">
                {companyLinks.map(([label, href]) => (
                  <li key={href}>
                    <Link href={href} className="hover:text-white">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-center text-sm text-purple-200">
          Bookhushly is part of <strong>Longman Vicky & Co Ltd</strong>. ©{" "}
          {currentYear} Bookhushly.
        </div>
      </div>
    </footer>
  );
}

/* Demo component that shows all variants for quick preview */
export default function FooterVariantsDemo() {
  return (
    <div className="space-y-24 bg-[#08020b]">
      <FooterBentoGrid />
      <FooterSplitScreen />
      <FooterSidebar />
      <FooterCardStack />
    </div>
  );
}
