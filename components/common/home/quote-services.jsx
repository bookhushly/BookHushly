import {
  ArrowRight,
  FileText,
  Clock,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

export default function QuoteConversionSection() {
  const services = [
    {
      icon: FileText,
      title: "Instant Quotes",
      description: "Receive detailed pricing within 60 seconds of submission",
    },
    {
      icon: Clock,
      title: "Always Available",
      description: "Submit requests 24/7 from anywhere in Nigeria",
    },
    {
      icon: ShieldCheck,
      title: "Verified Quality",
      description: "All services thoroughly vetted by BookHushly",
    },
  ];

  const benefits = [
    "Transparent pricing",
    "Quick turnaround",
    "Multiple payment methods",
    "Dedicated support",
  ];

  return (
    <section className="relative py-20 px-4 overflow-hidden bg-white">
      {/* Subtle background */}
      <div className="absolute inset-0">
        <div className="absolute top-40 left-20 w-96 h-96 bg-purple-50 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-purple-100 rounded-full blur-3xl opacity-40"></div>
      </div>

      <div className="relative max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-1.5 rounded-full bg-purple-50 border border-purple-100 text-purple-700 text-sm font-medium mb-6">
            Quote Services
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            Request a Quote in Minutes
          </h2>

          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get instant, detailed quotes for logistics and security services
            across Nigeria
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-xl border border-gray-200 hover:border-purple-200 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-lg bg-purple-600 flex items-center justify-center mb-6">
                <service.icon className="w-6 h-6 text-white" strokeWidth={2} />
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {service.title}
              </h3>

              <p className="text-gray-600 text-sm leading-relaxed">
                {service.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Card */}
        <div className="relative">
          <div className="bg-purple-600 rounded-2xl p-12 md:p-14 overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.05)_50%,transparent_75%,transparent_100%)]"></div>

            <div className="relative">
              <h3 className="text-3xl font-bold text-white mb-3 text-center">
                Ready to Get Started?
              </h3>

              <p className="text-purple-100 text-center mb-8 max-w-xl mx-auto">
                Submit your requirements and receive competitive quotes from
                BookHushly
              </p>

              {/* Benefits */}
              <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 mb-10">
                {benefits.map((benefit, index) => (
                  <div
                    key={index}
                    className="inline-flex items-center gap-2 text-white"
                  >
                    <CheckCircle2
                      className="w-4 h-4 text-purple-200"
                      strokeWidth={2}
                    />
                    <span className="text-sm">{benefit}</span>
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href="/quote-services?tab=logistics"
                  className="group inline-flex items-center gap-2 px-8 py-3.5 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-200 shadow-lg"
                >
                  Request Logistics Quote
                  <ArrowRight
                    className="w-5 h-5 group-hover:translate-x-0.5 transition-transform"
                    strokeWidth={2}
                  />
                </Link>

                <Link
                  href="/quote-services?tab=security"
                  className="group inline-flex items-center gap-2 px-8 py-3.5 bg-purple-700 text-white rounded-lg font-semibold hover:bg-purple-800 transition-all duration-200 border border-purple-500"
                >
                  Request Security Quote
                  <ArrowRight
                    className="w-5 h-5 group-hover:translate-x-0.5 transition-transform"
                    strokeWidth={2}
                  />
                </Link>
              </div>

              <p className="text-purple-200 text-xs text-center mt-6">
                No commitment • Free quotes • Quick response
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
