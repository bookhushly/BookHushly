import Link from "next/link";
import { FaFacebookF, FaInstagram, FaTiktok, FaTwitter } from "react-icons/fa";

export function Footer() {
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

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center md:text-left">
          {/* Brand & description */}
          <div>
            <h3 className="text-2xl font-bold mb-3">Bookhushly</h3>
            <p className="text-blue-200 text-sm mb-6 leading-relaxed">
              Connecting Nigeria and Africa with quality hospitality, logistics,
              and security services. Your trusted platform for premium bookings.
            </p>
            <div className="flex justify-center md:justify-start space-x-4">
              {socialLinks.map(({ href, icon, label }, idx) => (
                <Link
                  key={idx}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Visit Bookhushly on ${label}`}
                  className="
                    w-9 h-9 flex items-center justify-center rounded-full
                    bg-white/10 
                    transition-all duration-300
                    hover:bg-white/20 hover:scale-110
                    group
                    relative
                    overflow-hidden
                  "
                >
                  <span className="z-10 text-white">{icon}</span>
                  <span
                    className="
                      absolute inset-0 rounded-full
                      transform scale-0
                      bg-white/20
                      group-hover:scale-100
                      transition-transform duration-300
                    "
                  ></span>
                </Link>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-yellow-400 font-semibold mb-3 uppercase text-sm tracking-wide relative inline-block">
              Services
              <span className="absolute -bottom-1 left-0 w-6 h-0.5 bg-yellow-400"></span>
            </h4>
            <ul className="space-y-2 text-blue-200 text-sm">
              {serviceLinks.map(([label, href]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="
                      relative inline-block
                      hover:text-white
                      transition-colors duration-200
                      before:absolute before:-bottom-0.5 before:left-0
                      before:h-0.5 before:bg-yellow-400 before:scale-x-0
                      before:origin-left
                      group
                    "
                  >
                    <span className="relative z-10">{label}</span>
                    <span
                      className="
                        absolute -bottom-0.5 left-0 h-0.5 bg-yellow-400
                        transition-transform duration-300
                        group-hover:scale-x-100
                      "
                    ></span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-yellow-400 font-semibold mb-3 uppercase text-sm tracking-wide relative inline-block">
              Company
              <span className="absolute -bottom-1 left-0 w-6 h-0.5 bg-yellow-400"></span>
            </h4>
            <ul className="space-y-2 text-blue-200 text-sm">
              {companyLinks.map(([label, href]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="
                      relative inline-block
                      hover:text-white
                      transition-colors duration-200
                      before:absolute before:-bottom-0.5 before:left-0
                      before:h-0.5 before:bg-yellow-400 before:scale-x-0
                      before:origin-left
                      group
                    "
                  >
                    <span className="relative z-10">{label}</span>
                    <span
                      className="
                        absolute -bottom-0.5 left-0 h-0.5 bg-yellow-400
                        transition-transform duration-300
                        group-hover:scale-x-100
                      "
                    ></span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider & bottom text */}
        <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-blue-200 leading-relaxed">
          <p>
            Bookhushly is part of <strong>Longman Vicky & Co Ltd</strong> — the
            leader in hospitality, logistics, and security services across
            Nigeria and Africa.
          </p>
          <p className="mt-2">
            © {currentYear} Bookhushly. All rights reserved.
          </p>
        </div>
      </div>

      {/* Decorative gradient bar */}
      <div className="w-full h-1 bg-gradient-to-r from-yellow-400 via-blue-500 to-purple-500"></div>
    </footer>
  );
}
