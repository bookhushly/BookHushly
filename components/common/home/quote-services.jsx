import {
  ArrowRight,
  FileText,
  Clock,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

const SERVICES = [
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

const BENEFITS = [
  "Transparent pricing",
  "Quick turnaround",
  "Multiple payment methods",
  "Dedicated support",
];

export default function QuoteConversionSection() {
  return (
    <section className="py-24 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* ── Header ── */}
        <div className="max-w-xl mb-16">
          <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-violet-600 mb-5">
            <span className="h-px w-6 bg-violet-500" />
            Quote Services
          </span>
          <h2 className="font-fraunces text-4xl md:text-5xl font-semibold text-gray-900 leading-[1.1] mb-4">
            Request a quote
            <br />
            in minutes.
          </h2>
          <p className="text-gray-500 text-lg leading-relaxed">
            Get instant, detailed quotes for logistics and security services
            across Nigeria.
          </p>
        </div>

        {/* ── Feature cards + CTA — side by side on desktop ── */}
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Feature cards — 3 col */}
          <div className="lg:col-span-3 grid sm:grid-cols-3 lg:grid-cols-1 gap-4">
            {SERVICES.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="flex items-start gap-4 p-6 rounded-2xl border border-gray-100 bg-gray-50 hover:border-violet-200 hover:bg-violet-50/40 transition-all duration-200"
              >
                <div className="h-10 w-10 rounded-xl bg-violet-600 flex items-center justify-center shrink-0">
                  <Icon className="h-4.5 w-4.5 text-white" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">
                    {title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA card — 2 col */}
          <div className="lg:col-span-2">
            <div className="h-full bg-gray-950 rounded-2xl p-8 md:p-10 flex flex-col justify-between">
              {/* Top */}
              <div>
                <h3 className="font-fraunces text-2xl md:text-3xl font-semibold text-white leading-tight mb-3">
                  Ready to get
                  <br />
                  started?
                </h3>
                <p className="text-white/50 text-sm leading-relaxed mb-8">
                  Submit your requirements and receive competitive quotes from
                  BookHushly.
                </p>

                {/* Benefits */}
                <div className="grid grid-cols-2 gap-2 mb-8">
                  {BENEFITS.map((benefit) => (
                    <div key={benefit} className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-violet-400 shrink-0" />
                      <span className="text-xs text-white/60">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTAs */}
              <div className="space-y-3">
                <Link
                  href="/quote-services?tab=logistics"
                  className="group flex items-center justify-between w-full px-5 py-3.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold rounded-xl transition-all duration-200"
                >
                  Logistics quote
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-200" />
                </Link>
                <Link
                  href="/quote-services?tab=security"
                  className="group flex items-center justify-between w-full px-5 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white text-sm font-semibold rounded-xl transition-all duration-200"
                >
                  Security quote
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-200" />
                </Link>
                <p className="text-white/25 text-xs text-center pt-1">
                  No commitment · Free quotes · Quick response
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
