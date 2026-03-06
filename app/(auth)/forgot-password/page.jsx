"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ArrowRight, MailCheck, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import {
  sendPasswordResetOtp,
  verifyPasswordResetOtp,
} from "@/app/actions/auth";

function Steps({ current }) {
  const steps = ["Email", "Verify OTP"];
  return (
    <div className="flex items-center gap-2 mb-8">
      {steps.map((label, i) => {
        const idx = i + 1;
        const done = idx < current;
        const active = idx === current;
        return (
          <div key={label} className="flex items-center gap-2">
            <div
              className={`flex items-center gap-2 ${active || done ? "" : "opacity-40"}`}
            >
              <div
                className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                  done
                    ? "bg-violet-600 text-white"
                    : active
                      ? "bg-violet-100 text-violet-700 ring-2 ring-violet-600"
                      : "bg-gray-100 text-gray-400"
                }`}
              >
                {done ? "✓" : idx}
              </div>
              <span
                className={`text-xs font-medium ${active ? "text-gray-900" : done ? "text-gray-500" : "text-gray-400"}`}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`h-px w-8 transition-colors ${done ? "bg-violet-400" : "bg-gray-200"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);

  const sendOtpMutation = useMutation({
    mutationFn: async (email) => {
      const result = await sendPasswordResetOtp(email);
      if (result.error) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      setStep(2);
      toast.success(`OTP sent to ${email}`);
    },
    onError: (error) => toast.error(error.message),
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async ({ email, otp }) => {
      const result = await verifyPasswordResetOtp(email, otp);
      if (result.error) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      toast.success("OTP verified — redirecting…");
      router.push("/reset-password");
    },
    onError: (error) => toast.error(error.message),
  });

  const isPending = sendOtpMutation.isPending || verifyOtpMutation.isPending;

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email");
      return;
    }
    sendOtpMutation.mutate(email);
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    if (otp.trim().length < 4) {
      toast.error("Please enter the OTP from your email");
      return;
    }
    verifyOtpMutation.mutate({ email, otp });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-bricolage">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
        <Link href="/">
          <Image
            src="/logo.png"
            alt="BookHushly"
            width={120}
            height={36}
            className="h-8 w-auto object-contain"
            priority
          />
        </Link>
        <Link
          href="/login"
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          Back to sign in
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <Steps current={step} />

          {step === 1 ? (
            <>
              <div className="mb-7">
                <div className="mb-5 h-12 w-12 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center">
                  <MailCheck className="h-5 w-5 text-violet-600" />
                </div>
                <h1 className="font-fraunces text-2xl font-semibold text-gray-900 mb-1.5">
                  Forgot your password?
                </h1>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Enter your email and we&apos;ll send you a one-time code.
                </p>
              </div>

              {sendOtpMutation.isError && (
                <Alert variant="destructive" className="mb-5">
                  <AlertDescription className="text-sm">
                    {sendOtpMutation.error.message}
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleEmailSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="email"
                    className="text-gray-700 text-sm font-medium"
                  >
                    Email address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isPending}
                    className="h-11 border-gray-200 bg-gray-50 focus:bg-white focus:border-violet-500 focus:ring-violet-500/20 transition-all text-gray-900 placeholder:text-gray-400"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full h-11 bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2"
                >
                  {isPending ? (
                    <>
                      <LoadingSpinner className="h-4 w-4" /> Sending…
                    </>
                  ) : (
                    <>
                      Send OTP <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </>
          ) : (
            <>
              <div className="mb-7">
                <div className="mb-5 h-12 w-12 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5 text-violet-600" />
                </div>
                <h1 className="font-fraunces text-2xl font-semibold text-gray-900 mb-1.5">
                  Enter your OTP
                </h1>
                <p className="text-gray-500 text-sm leading-relaxed">
                  We sent a code to{" "}
                  <span className="font-medium text-gray-700">{email}</span>. It
                  expires shortly.
                </p>
              </div>

              {verifyOtpMutation.isError && (
                <Alert variant="destructive" className="mb-5">
                  <AlertDescription className="text-sm">
                    {verifyOtpMutation.error.message}
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleOtpSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="otp"
                    className="text-gray-700 text-sm font-medium"
                  >
                    One-time code
                  </Label>
                  <Input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    placeholder="000000"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    disabled={isPending}
                    className="h-11 border-gray-200 bg-gray-50 focus:bg-white focus:border-violet-500 focus:ring-violet-500/20 transition-all text-gray-900 tracking-[0.3em] text-center font-mono text-lg placeholder:tracking-normal placeholder:font-sans placeholder:text-sm placeholder:text-gray-400"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full h-11 bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2"
                >
                  {isPending ? (
                    <>
                      <LoadingSpinner className="h-4 w-4" /> Verifying…
                    </>
                  ) : (
                    <>
                      Verify OTP <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
                <p className="text-center text-xs text-gray-400">
                  Didn&apos;t receive it?{" "}
                  <button
                    type="button"
                    onClick={() => sendOtpMutation.mutate(email)}
                    disabled={isPending}
                    className="text-violet-600 hover:text-violet-700 underline underline-offset-2 transition-colors disabled:opacity-50"
                  >
                    Resend code
                  </button>{" "}
                  or{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setOtp("");
                    }}
                    className="text-violet-600 hover:text-violet-700 underline underline-offset-2 transition-colors"
                  >
                    change email
                  </button>
                </p>
              </form>
            </>
          )}

          <p className="mt-8 text-center text-sm text-gray-500">
            Remembered it?{" "}
            <Link
              href="/login"
              className="text-violet-600 hover:text-violet-700 font-medium transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
