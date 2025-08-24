import Image from "next/image";
import Link from "next/link";
import { FaFacebookF, FaInstagram, FaTwitter } from "react-icons/fa";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white relative">
      <div className="container mx-auto px-4 py-3 md:py-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-6">
          {/* Logo and Description Section */}
          <div className="md:col-span-5">
            <div className="flex items-center justify-center md:justify-start mb-2">
              <h3 className="text-xl md:text-2xl font-bold text-white">
                Bookhushly
              </h3>
            </div>
            <p className="text-blue-200 mb-2 text-center md:text-left text-xs md:text-sm leading-tight">
              Connecting Nigeria and Africa with quality hospitality, logistics,
              and security services. Your trusted platform for premium service
              bookings.
            </p>
            <div className="flex space-x-2 justify-center md:justify-start">
              <Link
                href="https://www.facebook.com/share/16PPc7nPTk/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit Bookhushly on Facebook"
                className="w-7 h-7 md:w-8 md:h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 transform hover:scale-110"
              >
                <FaFacebookF className="text-xs md:text-sm text-white" />
              </Link>
              <Link
                href="https://www.instagram.com/bookhushly?igsh=ejk1cGo3aGhodTJ0&utm_source=qr"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit Bookhushly on Instagram"
                className="w-7 h-7 md:w-8 md:h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 transform hover:scale-110"
              >
                <FaInstagram className="text-xs md:text-sm text-white" />
              </Link>
              <Link
                href="https://x.com/bookhushly?s=21"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit Bookhushly on Twitter"
                className="w-7 h-7 md:w-8 md:h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 transform hover:scale-110"
              >
                <FaTwitter className="text-xs md:text-sm text-white" />
              </Link>
            </div>
          </div>

          {/* Services Section */}
          <div className="md:col-span-3">
            <h4 className="font-bold text-sm md:text-base mb-2 text-yellow-400 relative text-center md:text-left">
              Services
              <div className="absolute -bottom-0.5 left-1/2 md:left-0 transform -translate-x-1/2 md:translate-x-0 w-4 h-0.5 bg-yellow-400"></div>
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-1 gap-1 text-center md:text-left">
              <Link
                href="/services?category=hotels"
                className="text-blue-200 hover:text-white transition-colors duration-200 text-xs hover:translate-x-1 inline-block"
              >
                Hotels
              </Link>
              <Link
                href="/services?category=serviced_apartments"
                className="text-blue-200 hover:text-white transition-colors duration-200 text-xs hover:translate-x-1 inline-block"
              >
                Serviced Apartments
              </Link>
              <Link
                href="/services?category=food"
                className="text-blue-200 hover:text-white transition-colors duration-200 text-xs hover:translate-x-1 inline-block"
              >
                Food & Restaurants
              </Link>
              <Link
                href="/services?category=events"
                className="text-blue-200 hover:text-white transition-colors duration-200 text-xs hover:translate-x-1 inline-block"
              >
                Events
              </Link>
              <Link
                href="/services?category=car_rentals"
                className="text-blue-200 hover:text-white transition-colors duration-200 text-xs hover:translate-x-1 inline-block"
              >
                Car Rentals
              </Link>
              <Link
                href="/services?category=logistics"
                className="text-blue-200 hover:text-white transition-colors duration-200 text-xs hover:translate-x-1 inline-block"
              >
                Logistics
              </Link>
              <Link
                href="/services?category=security"
                className="text-blue-200 hover:text-white transition-colors duration-200 text-xs hover:translate-x-1 inline-block"
              >
                Security
              </Link>
            </div>
          </div>

          {/* Company Section */}
          <div className="md:col-span-4">
            <h4 className="font-bold text-sm md:text-base mb-2 text-yellow-400 relative text-center md:text-left">
              Company
              <div className="absolute -bottom-0.5 left-1/2 md:left-0 transform -translate-x-1/2 md:translate-x-0 w-4 h-0.5 bg-yellow-400"></div>
            </h4>
            <div className="grid grid-cols-3 md:grid-cols-2 gap-1 text-center md:text-left">
              <Link
                href="/about"
                className="text-blue-200 hover:text-white transition-colors duration-200 text-xs hover:translate-x-1 inline-block"
              >
                About Us
              </Link>
              <Link
                href="/careers"
                className="text-blue-200 hover:text-white transition-colors duration-200 text-xs hover:translate-x-1 inline-block"
              >
                Careers
              </Link>
              <Link
                href="/blog"
                className="text-blue-200 hover:text-white transition-colors duration-200 text-xs hover:translate-x-1 inline-block"
              >
                Blog
              </Link>
              <Link
                href="/contact"
                className="text-blue-200 hover:text-white transition-colors duration-200 text-xs hover:translate-x-1 inline-block"
              >
                Contact
              </Link>
              <Link
                href="/terms"
                className="text-blue-200 hover:text-white transition-colors duration-200 text-xs hover:translate-x-1 inline-block"
              >
                Terms
              </Link>
              <Link
                href="/privacy"
                className="text-blue-200 hover:text-white transition-colors duration-200 text-xs hover:translate-x-1 inline-block"
              >
                Privacy
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-4 md:mt-6 pt-3 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <div className="text-xs text-blue-200 text-center md:text-left">
              <p className="text-blue-200 mb-1 text-center md:text-left text-xs leading-tight">
                Bookhushly is part of Longman Vicky & Co Ltd, the leader in
                hospitality, logistics, and security services in Nigeria and
                Africa.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Element */}
      <div className="relative w-full h-1 bg-gradient-to-r from-yellow-400 via-blue-500 to-purple-500"></div>
    </footer>
  );
}
