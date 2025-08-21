import Image from "next/image";
import Link from "next/link";
import { FaFacebookF, FaInstagram, FaTwitter } from "react-icons/fa";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white relative">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Logo and Description Section */}
          <div className="lg:col-span-5">
            <div className="flex items-center mb-4">
              <h3 className="text-3xl sm:text-xl font-bold text-white">
                Bookhushly
              </h3>
            </div>
            <p className="text-blue-200 leading-relaxed mb-4 max-w-md text-center lg:text-left text-sm">
              Connecting Nigeria and Africa with quality hospitality, logistics,
              and security services. Your trusted platform for premium service
              bookings.
            </p>
            <div className="flex space-x-3 justify-center lg:justify-start">
              <Link
                href="https://www.facebook.com/share/16PPc7nPTk/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit Bookhushly on Facebook"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 transform hover:scale-110"
              >
                <FaFacebookF className="text-base text-white" />
              </Link>
              <Link
                href="https://www.instagram.com/bookhushly?igsh=ejk1cGo3aGhodTJ0&utm_source=qr"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit Bookhushly on Instagram"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 transform hover:scale-110"
              >
                <FaInstagram className="text-base text-white" />
              </Link>
              <Link
                href="https://x.com/bookhushly?s=21"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit Bookhushly on Twitter"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 transform hover:scale-110"
              >
                <FaTwitter className="text-base text-white" />
              </Link>
            </div>
          </div>

          {/* Services Section */}
          <div className="lg:col-span-3">
            <h4 className="font-bold text-base mb-4 text-yellow-400 relative">
              Services
              <div className="absolute -bottom-1 left-0 w-6 h-0.5 bg-yellow-400"></div>
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/services?category=hotels"
                  className="text-blue-200 hover:text-white transition-colors duration-200 text-xs sm:text-sm hover:translate-x-1 inline-block"
                >
                  Hotels
                </Link>
              </li>
              <li>
                <Link
                  href="/services?category=serviced_apartments"
                  className="text-blue-200 hover:text-white transition-colors duration-200 text-xs sm:text-sm hover:translate-x-1 inline-block"
                >
                  Serviced Apartments
                </Link>
              </li>
              <li>
                <Link
                  href="/services?category=food"
                  className="text-blue-200 hover:text-white transition-colors duration-200 text-xs sm:text-sm hover:translate-x-1 inline-block"
                >
                  Food & Restaurants
                </Link>
              </li>
              <li>
                <Link
                  href="/services?category=events"
                  className="text-blue-200 hover:text-white transition-colors duration-200 text-xs sm:text-sm hover:translate-x-1 inline-block"
                >
                  Events
                </Link>
              </li>
              <li>
                <Link
                  href="/services?category=car_rentals"
                  className="text-blue-200 hover:text-white transition-colors duration-200 text-xs sm:text-sm hover:translate-x-1 inline-block"
                >
                  Car Rentals
                </Link>
              </li>
              <li>
                <Link
                  href="/services?category=logistics"
                  className="text-blue-200 hover:text-white transition-colors duration-200 text-xs sm:text-sm hover:translate-x-1 inline-block"
                >
                  Logistics
                </Link>
              </li>
              <li>
                <Link
                  href="/services?category=security"
                  className="text-blue-200 hover:text-white transition-colors duration-200 text-xs sm:text-sm hover:translate-x-1 inline-block"
                >
                  Security
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Section */}
          <div className="lg:col-span-4">
            <h4 className="font-bold text-base mb-4 text-yellow-400 relative">
              Company
              <div className="absolute -bottom-1 left-0 w-6 h-0.5 bg-yellow-400"></div>
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/about"
                className="text-blue-200 hover:text-white transition-colors duration-200 text-xs sm:text-sm hover:translate-x-1 inline-block"
              >
                About Us
              </Link>
              <Link
                href="/careers"
                className="text-blue-200 hover:text-white transition-colors duration-200 text-xs sm:text-sm hover:translate-x-1 inline-block"
              >
                Careers
              </Link>
              <Link
                href="/blog"
                className="text-blue-200 hover:text-white transition-colors duration-200 text-xs sm:text-sm hover:translate-x-1 inline-block"
              >
                Blog
              </Link>
              <Link
                href="/contact"
                className="text-blue-200 hover:text-white transition-colors duration-200 text-xs sm:text-sm hover:translate-x-1 inline-block"
              >
                Contact
              </Link>
              <Link
                href="/terms"
                className="text-blue-200 hover:text-white transition-colors duration-200 text-xs sm:text-sm hover:translate-x-1 inline-block"
              >
                Terms of Service
              </Link>
              <Link
                href="/privacy"
                className="text-blue-200 hover:text-white transition-colors duration-200 text-xs sm:text-sm hover:translate-x-1 inline-block"
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-6 border-t border-white/10">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-3 lg:space-y-0">
            <div className="text-xs text-blue-200 text-center lg:text-left">
              <p className="flex items-center justify-center lg:justify-start">
                &copy; {currentYear} Bookhushly. All rights reserved. Made with
                <span className="text-red-400 mx-1 animate-pulse">❤️</span>
                for Africa.
              </p>
            </div>
            <div className="flex items-center space-x-4 text-xs">
              <div className="flex items-center space-x-1 bg-white/5 px-2 py-0.5 rounded-full">
                <span className="text-base">🇳🇬</span>
                <span className="text-blue-200">Nigeria</span>
              </div>
              <div className="flex items-center space-x-1 bg-white/5 px-2 py-0.5 rounded-full">
                <span className="text-base">🌍</span>
                <span className="text-blue-200">Africa</span>
              </div>
              <div className="flex items-center space-x-1 bg-white/5 px-2 py-0.5 rounded-full">
                <span className="text-base">🚀</span>
                <span className="text-blue-200">Growing</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Element */}
      <div className="relative w-full h-1 bg-gradient-to-r from-yellow-400 via-blue-500 to-purple-500"></div>
    </footer>
  );
}
