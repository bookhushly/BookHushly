"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Eye,
  EyeOff,
  ArrowRight,
  Star,
  MapPin,
  CalendarCheck,
} from "lucide-react";
import { toast } from "sonner";
import { login } from "@/app/actions/auth";
import { useAuthActions } from "@/hooks/use-auth";

const SOCIAL_PROOF = [
  { icon: Star, text: "4.9 rating across 2,400+ bookings" },
  { icon: MapPin, text: "Available in 12 Nigerian states" },
  { icon: CalendarCheck, text: "Hotels, events, apartments & more" },
];

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const { invalidateAuth } = useAuthActions();

  const loginMutation = useMutation({
    mutationFn: async (credentials) => {
      const fd = new FormData();
      fd.append("email", credentials.email);
      fd.append("password", credentials.password);
      const result = await login(fd);
      if (result?.error) throw new Error(result.error);
      return result;
    },
    onSuccess: (data) => {
      invalidateAuth();
      toast.success("Welcome back!");
      if (data?.redirectPath) window.location.href = data.redirectPath;
    },
    onError: (error) => toast.error(error.message),
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (loginMutation.error) loginMutation.reset();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    loginMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen flex font-bricolage">
      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden bg-gray-950 flex-col">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1400&q=85&auto=format&fit=crop"
            alt="BookHushly"
            fill
            className="object-cover opacity-40"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/60 to-gray-950/20" />
          <svg
            className="absolute inset-0 w-full h-full opacity-[0.03] pointer-events-none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <filter id="noise-login">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.9"
                numOctaves="4"
                stitchTiles="stitch"
              />
              <feColorMatrix type="saturate" values="0" />
            </filter>
            <rect width="100%" height="100%" filter="url(#noise-login)" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col h-full p-10">
          {/* Logo — same container pattern as navbar */}
          <div className="relative w-32 h-32">
            <Image
              src="/logo.png"
              alt="BookHushly"
              fill
              className="object-contain scale-150 object-left brightness-0 invert"
              priority
            />
          </div>

          <div className="flex-1 flex flex-col justify-center max-w-sm">
            <p className="text-violet-400 text-sm font-medium tracking-widest uppercase mb-5">
              Nigeria&apos;s booking platform
            </p>
            <h2 className="font-fraunces text-white text-[3.2rem] font-semibold leading-[1.1] mb-6">
              Every booking,
              <br />
              effortlessly done.
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed">
              Hotels, serviced apartments, events, logistics, and security — all
              in one place. Built for Nigeria.
            </p>
          </div>

          <div className="space-y-3">
            {SOCIAL_PROOF.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center shrink-0">
                  <Icon className="h-3.5 w-3.5 text-violet-400" />
                </div>
                <span className="text-gray-300 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center p-6 border-b border-gray-100">
          <div className="relative w-32 h-32">
            <Image
              src="/logo.png"
              alt="BookHushly"
              fill
              className="object-contain object-left"
              priority
            />
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center px-6 py-10 sm:px-10 lg:px-16 xl:px-24 max-w-lg lg:max-w-none mx-auto w-full lg:mx-0">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Sign in</h1>
            <p className="text-gray-500 text-sm">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="text-violet-600 hover:text-violet-700 font-medium transition-colors"
              >
                Create one free
              </Link>
            </p>
          </div>

          {loginMutation.isError && (
            <Alert variant="destructive" className="mb-5">
              <AlertDescription className="text-sm">
                {loginMutation.error.message}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label
                htmlFor="email"
                className="text-gray-700 text-sm font-medium"
              >
                Email address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                disabled={loginMutation.isPending}
                className="h-11 border-gray-200 bg-gray-50 focus:bg-white focus:border-violet-500 focus:ring-violet-500/20 transition-all text-gray-900 placeholder:text-gray-400"
                required
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className="text-gray-700 text-sm font-medium"
                >
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-violet-600 hover:text-violet-700 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loginMutation.isPending}
                  className="h-11 pr-11 border-gray-200 bg-gray-50 focus:bg-white focus:border-violet-500 focus:ring-violet-500/20 transition-all text-gray-900 placeholder:text-gray-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full h-11 bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 mt-1"
            >
              {loginMutation.isPending ? (
                <>
                  <LoadingSpinner className="h-4 w-4" /> Signing in…
                </>
              ) : (
                <>
                  Continue <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-10 text-xs text-gray-400 leading-relaxed">
            By continuing, you agree to BookHushly&apos;s{" "}
            <Link
              href="/terms"
              className="text-gray-500 hover:text-gray-700 underline underline-offset-2 transition-colors"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="text-gray-500 hover:text-gray-700 underline underline-offset-2 transition-colors"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>

        <div className="px-6 pb-6 sm:px-10 lg:px-16 xl:px-24">
          <Link
            href="/"
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            ← Back to bookhushly.com
          </Link>
        </div>
      </div>
    </div>
  );
}
