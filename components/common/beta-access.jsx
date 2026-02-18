"use client";

import { useRouter } from "next/navigation";
import { Sparkles, Bell, ArrowLeft, Zap, Shield, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function BetaAccessPage({
  featureName = "This Feature",
  featureDescription = "We're putting the finishing touches on something great.",
  returnPath = "/",
  returnLabel = "Go Back",
}) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Subtle grid background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(147,51,234,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(147,51,234,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Radial purple glow - top center */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center top, rgba(147,51,234,0.08) 0%, transparent 70%)",
        }}
      />

      {/* Nav */}
      <nav className="relative z-10 flex items-center px-6 py-5 md:px-12">
        <button
          onClick={() => router.push(returnPath)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-purple-600 transition-colors duration-200 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
          {returnLabel}
        </button>
      </nav>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg text-center">
          {/* Badge */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 bg-purple-50 border border-purple-100 text-purple-700 text-xs font-semibold px-4 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" />
              BETA ACCESS
            </div>
          </div>

          {/* Icon */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-24 h-24 bg-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-200 rotate-3">
                <Sparkles className="w-11 h-11 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-7 h-7 bg-yellow-400 rounded-full flex items-center justify-center shadow-sm">
                <Star className="w-3.5 h-3.5 text-yellow-800 fill-yellow-800" />
              </div>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight leading-tight">
            {featureName} is{" "}
            <span className="text-purple-600">coming soon</span>
          </h1>

          <p className="text-gray-500 text-base md:text-lg leading-relaxed mb-10 max-w-md mx-auto">
            {featureDescription} This page is currently available to{" "}
            <span className="text-purple-600 font-medium">beta users only</span>
            . We'll notify you when it's ready.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {[
              { icon: Zap, label: "Fast & Optimized" },
              { icon: Shield, label: "Secure" },
              { icon: Sparkles, label: "Built for Nigeria" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="inline-flex items-center gap-1.5 bg-gray-50 border border-gray-100 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-full"
              >
                <Icon className="w-3.5 h-3.5 text-purple-500" />
                {label}
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => router.push(returnPath)}
              variant="outline"
              className="h-12 px-8 border-gray-200 text-gray-700 hover:border-purple-300 hover:text-purple-700 transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Return Home
            </Button>
            <Button
              onClick={() => router.push("/services")}
              className="h-12 px-8 bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-100 transition-all duration-200"
            >
              <Bell className="w-4 h-4 mr-2" />
              Explore Services
            </Button>
          </div>

          {/* Bottom note */}
          <p className="mt-10 text-xs text-gray-400">
            Already a beta user?{" "}
            <button
              onClick={() => router.push("/auth/login")}
              className="text-purple-600 hover:underline font-medium"
            >
              Sign in here
            </button>
          </p>
        </div>
      </main>

      {/* Footer line */}
      <footer className="relative z-10 px-6 py-4 text-center">
        <p className="text-xs text-gray-300">
          © {new Date().getFullYear()} BookHushly. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
