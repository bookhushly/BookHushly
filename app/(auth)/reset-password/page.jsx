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
import {
  Eye,
  EyeOff,
  ArrowRight,
  Check,
  X,
  KeyRound,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { updatePassword } from "@/app/actions/auth";
import { useAuthActions } from "@/hooks/use-auth";

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

const TopBar = () => (
  <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
    <Link href="/">
      <div className="relative w-32 h-32">
        <Image
          src="/logo.png"
          alt="BookHushly"
          fill
          className="object-contain object-left scale-150"
          priority
        />
      </div>
    </Link>
    <Link
      href="/login"
      className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
    >
      Back to sign in
    </Link>
  </div>
);

export default function ResetPasswordPage() {
  const router = useRouter();
  const { invalidateAuth } = useAuthActions();
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState(false);

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

  const mutation = useMutation({
    mutationFn: async (password) => {
      const result = await updatePassword(password);
      if (result.error) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      setSuccess(true);
      invalidateAuth();
      setTimeout(() => router.push("/login"), 3000);
    },
    onError: (error) => toast.error(error.message),
  });

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
    mutation.mutate(formData.password);
  };

  // ── Success ──
  if (success) {
    return (
      <div className="min-h-screen bg-white flex flex-col font-bricolage">
        <TopBar />
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="w-full max-w-sm text-center">
            <div className="mx-auto mb-6 h-16 w-16 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-7 w-7 text-green-500" />
            </div>
            <h1 className="font-fraunces text-2xl font-semibold text-gray-900 mb-2">
              Password updated
            </h1>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Your password has been changed. Redirecting you to sign in…
            </p>
            <Link href="/login">
              <Button className="w-full h-11 bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm">
                Go to sign in
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Form ──
  return (
    <div className="min-h-screen bg-white flex flex-col font-bricolage">
      <TopBar />

      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <div className="mb-5 h-12 w-12 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center">
              <KeyRound className="h-5 w-5 text-violet-600" />
            </div>
            <h1 className="font-fraunces text-2xl font-semibold text-gray-900 mb-1.5">
              Set new password
            </h1>
            <p className="text-gray-500 text-sm leading-relaxed">
              Choose a strong password for your account.
            </p>
          </div>

          {mutation.isError && (
            <Alert variant="destructive" className="mb-5">
              <AlertDescription className="text-sm">
                {mutation.error.message}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* New password */}
            <div className="space-y-1.5">
              <Label
                htmlFor="password"
                className="text-gray-700 text-sm font-medium"
              >
                New password
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
                  disabled={mutation.isPending}
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
                Confirm new password
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
                  disabled={mutation.isPending}
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
              disabled={mutation.isPending || !allMet || !passwordsMatch}
              className="w-full h-11 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2"
            >
              {mutation.isPending ? (
                <>
                  <LoadingSpinner className="h-4 w-4" /> Updating password…
                </>
              ) : (
                <>
                  Update password <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
