"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Eye,
  EyeOff,
  ArrowRight,
  Check,
  X,
  ShoppingBag,
  Building,
  CheckCircle2,
  MailCheck,
} from "lucide-react";
import { toast } from "sonner";
import { signup } from "@/app/actions/auth";

const PERKS = [
  "Instant booking confirmation",
  "Secure NGN & crypto payments",
  "Hotels, events, apartments & more",
  "Real-time booking management",
];

const passwordRules = [
  {
    key: "minLength",
    label: "At least 8 characters",
    test: (p) => p.length >= 8,
  },
  {
    key: "hasUppercase",
    label: "One uppercase letter",
    test: (p) => /[A-Z]/.test(p),
  },
  {
    key: "hasLowercase",
    label: "One lowercase letter",
    test: (p) => /[a-z]/.test(p),
  },
  { key: "hasNumber", label: "One number", test: (p) => /\d/.test(p) },
  {
    key: "hasSpecial",
    label: "One special char (@$!%*?&)",
    test: (p) => /[@$!%*?&]/.test(p),
  },
];

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "customer",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const checks = passwordRules.map((r) => ({
    ...r,
    met: r.test(formData.password),
  }));
  const allMet = checks.every((r) => r.met);
  const passwordsMatch =
    formData.password === formData.confirmPassword &&
    formData.confirmPassword.length > 0;

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!allMet) {
      toast.error("Password doesn't meet all requirements");
      return;
    }
    if (!passwordsMatch) {
      toast.error("Passwords do not match");
      return;
    }

    startTransition(async () => {
      const result = await signup({ formData });
      if (result.ok) {
        setIsSuccess(true);
      } else {
        const messages = {
          EMAIL_ALREADY_EXISTS:
            "This email is already registered. Please sign in.",
          PROFILE_CREATION_FAILED:
            "Account created but profile setup failed. Contact support.",
        };
        toast.error(
          messages[result.code] ||
            result.message ||
            "Something went wrong. Please try again.",
        );
      }
    });
  };

  // ── Success screen ──
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-white flex flex-col font-bricolage">
        <div className="flex items-center p-6 border-b border-gray-100">
          <div className="relative w-32 h-32">
            <Image
              src="/logo.png"
              alt="BookHushly"
              fill
              className="object-contain object-left scale-150"
              priority
            />
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="w-full max-w-sm text-center">
            <div className="mx-auto mb-6 h-16 w-16 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center">
              <MailCheck className="h-7 w-7 text-violet-600" />
            </div>
            <h1 className="font-fraunces text-2xl font-semibold text-gray-900 mb-2">
              Check your email
            </h1>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              We sent a verification link to{" "}
              <span className="font-medium text-gray-700">
                {formData.email}
              </span>
              . Verify your address to activate your account.
            </p>
            <Link href="/login">
              <Button className="w-full h-11 bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm">
                Go to sign in
              </Button>
            </Link>
            <p className="mt-4 text-xs text-gray-400">
              Wrong email?{" "}
              <button
                onClick={() => setIsSuccess(false)}
                className="text-violet-600 hover:text-violet-700 underline underline-offset-2"
              >
                Go back
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Main form ──
  return (
    <div className="min-h-screen flex font-bricolage">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden bg-gray-950 flex-col">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1400&q=85&auto=format&fit=crop"
            alt="BookHushly"
            fill
            className="object-cover opacity-35"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/55 to-gray-950/10" />
          <svg
            className="absolute inset-0 w-full h-full opacity-[0.03] pointer-events-none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <filter id="noise-reg">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.9"
                numOctaves="4"
                stitchTiles="stitch"
              />
              <feColorMatrix type="saturate" values="0" />
            </filter>
            <rect width="100%" height="100%" filter="url(#noise-reg)" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col h-full p-10">
          {/* Left panel logo */}
          <div className="relative w-32 h-32">
            <Image
              src="/logo.png"
              alt="BookHushly"
              fill
              className="object-contain object-left scale-150 brightness-0 invert"
              priority
            />
          </div>

          <div className="flex-1 flex flex-col justify-center max-w-sm">
            <p className="text-violet-400 text-sm font-medium tracking-widest uppercase mb-5">
              Join thousands of users
            </p>
            <h2 className="font-fraunces text-white text-[3.2rem] font-semibold leading-[1.1] mb-6">
              List, book, and
              <br />
              get things done.
            </h2>
            <p className="text-gray-400 text-xl leading-relaxed">
              Whether you&apos;re finding the perfect venue or growing your
              business — BookHushly is your platform.
            </p>
          </div>

          <div className="space-y-3">
            {PERKS.map((perk) => (
              <div key={perk} className="flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4 text-violet-400 shrink-0" />
                <span className="text-gray-300 text-base">{perk}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col bg-white overflow-y-auto">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center p-6 border-b border-gray-100">
          <div className="relative w-32 h-32">
            <Image
              src="/logo.png"
              alt="BookHushly"
              fill
              className="object-contain object-left scale-150"
              priority
            />
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center px-6 py-10 sm:px-10 lg:px-16 xl:px-24 max-w-lg lg:max-w-none mx-auto w-full lg:mx-0">
          <div className="mb-7">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Create your account
            </h1>
            <p className="text-gray-500 text-sm">
              Already have one?{" "}
              <Link
                href="/login"
                className="text-violet-600 hover:text-violet-700 font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role selector */}
            <div className="space-y-2">
              <Label className="text-gray-700 text-sm font-medium">
                I want to
              </Label>
              <RadioGroup
                value={formData.role}
                onValueChange={(v) => setFormData((p) => ({ ...p, role: v }))}
                className="grid grid-cols-2 gap-3"
              >
                {[
                  {
                    value: "customer",
                    icon: ShoppingBag,
                    label: "Book Services",
                    sub: "Find & book services",
                  },
                  {
                    value: "vendor",
                    icon: Building,
                    label: "List Services",
                    sub: "Grow your business",
                  },
                ].map(({ value, icon: Icon, label, sub }) => (
                  <label
                    key={value}
                    htmlFor={value}
                    className={`relative flex flex-col gap-1 p-4 rounded-xl border-2 cursor-pointer transition-all duration-150 ${
                      formData.role === value
                        ? "border-violet-600 bg-violet-50"
                        : "border-gray-200 hover:border-gray-300 bg-gray-50"
                    }`}
                  >
                    <RadioGroupItem
                      value={value}
                      id={value}
                      className="sr-only"
                    />
                    <Icon
                      className={`h-4 w-4 mb-0.5 ${formData.role === value ? "text-violet-600" : "text-gray-400"}`}
                    />
                    <span
                      className={`text-sm font-semibold ${formData.role === value ? "text-violet-700" : "text-gray-700"}`}
                    >
                      {label}
                    </span>
                    <span className="text-xs text-gray-400">{sub}</span>
                  </label>
                ))}
              </RadioGroup>
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <Label
                htmlFor="name"
                className="text-gray-700 text-sm font-medium"
              >
                Full name
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Chukwuemeka Obi"
                value={formData.name}
                onChange={handleChange}
                disabled={isPending}
                className="h-11 border-gray-200 bg-gray-50 focus:bg-white focus:border-violet-500 focus:ring-violet-500/20 transition-all text-gray-900 placeholder:text-gray-400"
                required
              />
            </div>

            {/* Email */}
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
                disabled={isPending}
                className="h-11 border-gray-200 bg-gray-50 focus:bg-white focus:border-violet-500 focus:ring-violet-500/20 transition-all text-gray-900 placeholder:text-gray-400"
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label
                htmlFor="password"
                className="text-gray-700 text-sm font-medium"
              >
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isPending}
                  className="h-11 pr-11 border-gray-200 bg-gray-50 focus:bg-white focus:border-violet-500 focus:ring-violet-500/20 transition-all text-gray-900 placeholder:text-gray-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {formData.password.length > 0 && (
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-1">
                  {checks.map((r) => (
                    <div key={r.key} className="flex items-center gap-1.5">
                      {r.met ? (
                        <Check className="h-3.5 w-3.5 text-green-500 shrink-0" />
                      ) : (
                        <X className="h-3.5 w-3.5 text-gray-300 shrink-0" />
                      )}
                      <span
                        className={`text-xs ${r.met ? "text-green-600" : "text-gray-400"}`}
                      >
                        {r.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div className="space-y-1.5">
              <Label
                htmlFor="confirmPassword"
                className="text-gray-700 text-sm font-medium"
              >
                Confirm password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={isPending}
                  className={`h-11 pr-11 bg-gray-50 transition-all text-gray-900 placeholder:text-gray-400 ${
                    formData.confirmPassword.length > 0
                      ? passwordsMatch
                        ? "border-green-400 focus:border-green-500 focus:ring-green-500/20"
                        : "border-red-300 focus:border-red-400 focus:ring-red-400/20"
                      : "border-gray-200 focus:border-violet-500 focus:ring-violet-500/20"
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 transition-colors"
                >
                  {showConfirm ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {formData.confirmPassword.length > 0 && (
                <p
                  className={`text-xs flex items-center gap-1 ${passwordsMatch ? "text-green-600" : "text-red-500"}`}
                >
                  {passwordsMatch ? (
                    <>
                      <Check className="h-3.5 w-3.5" /> Passwords match
                    </>
                  ) : (
                    <>
                      <X className="h-3.5 w-3.5" /> Passwords don&apos;t match
                    </>
                  )}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-11 bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 mt-1"
            >
              {isPending ? (
                <>
                  <LoadingSpinner className="h-4 w-4" /> Creating account…
                </>
              ) : (
                <>
                  Create account <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-8 text-xs text-gray-400 leading-relaxed">
            By creating an account, you agree to BookHushly&apos;s{" "}
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
