import Image from "next/image";
import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex">
              <div className="relative w-32 h-32">
                <Image
                  src="/logo.png"
                  alt="Bookhushly Logo"
                  fill
                  className="object-contain scale-150"
                  priority
                />
              </div>
            </div>
            <p className="text-sm text-blue-200 mb-4">
              Connecting Nigeria and Africa with quality hospitality, logistics,
              and security services.
            </p>
            <div className="flex space-x-4">
              <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                <span className="text-xs font-bold">f</span>
              </div>
              <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                <span className="text-xs font-bold">t</span>
              </div>
              <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                <span className="text-xs font-bold">in</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-yellow-400">Services</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/services?category=hotels"
                  className="text-blue-200 hover:text-white transition-colors"
                >
                  Hotels
                </Link>
              </li>
              <li>
                <Link
                  href="/services?category=food"
                  className="text-blue-200 hover:text-white transition-colors"
                >
                  Food & Restaurants
                </Link>
              </li>
              <li>
                <Link
                  href="/services?category=events"
                  className="text-blue-200 hover:text-white transition-colors"
                >
                  Events
                </Link>
              </li>
              <li>
                <Link
                  href="/services?category=logistics"
                  className="text-blue-200 hover:text-white transition-colors"
                >
                  Logistics
                </Link>
              </li>
              <li>
                <Link
                  href="/services?category=security"
                  className="text-blue-200 hover:text-white transition-colors"
                >
                  Security
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-yellow-400">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/about"
                  className="text-blue-200 hover:text-white transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/careers"
                  className="text-blue-200 hover:text-white transition-colors"
                >
                  Careers
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-blue-200 hover:text-white transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-blue-200 hover:text-white transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-blue-200 hover:text-white transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-blue-200 hover:text-white transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-yellow-400">Get Started</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/register"
                  className="text-blue-200 hover:text-white transition-colors"
                >
                  Sign Up
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="text-blue-200 hover:text-white transition-colors"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="text-blue-200 hover:text-white transition-colors"
                >
                  Browse Services
                </Link>
              </li>
              <li>
                <Link
                  href="/help"
                  className="text-blue-200 hover:text-white transition-colors"
                >
                  Help Center
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/20">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-blue-200 mb-4 md:mb-0">
              <p>
                &copy; {currentYear} Bookhushly. All rights reserved. Made with
                ❤️ for Africa.
              </p>
            </div>
            <div className="flex items-center space-x-6 text-sm text-blue-200">
              <span>🇳🇬 Nigeria</span>
              <span>🌍 Africa</span>
              <span>🚀 Growing</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
