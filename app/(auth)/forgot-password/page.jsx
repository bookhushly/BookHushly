"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Mail, ArrowLeft, CheckCircle, Lock } from "lucide-react";
import { toast } from "sonner";
import {
  sendPasswordResetOtp,
  verifyPasswordResetOtp,
} from "@/app/actions/auth";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("email"); // 'email', 'otp', or 'success'

  const sendOtpMutation = useMutation({
    mutationFn: async (email) => {
      const result = await sendPasswordResetOtp(email);
      if (result.error) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: () => {
      setStep("otp");
      toast.success("OTP sent!", {
        description: `Check your email (${email}) for the OTP to reset your password`,
        duration: 5000,
      });
    },
    onError: (error) => {
      toast.error("Failed to send OTP", {
        description: error.message,
        duration: 5000,
      });
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async ({ email, otp }) => {
      const result = await verifyPasswordResetOtp(email, otp);
      if (result.error) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: () => {
      toast.success("OTP verified!", {
        description: "Redirecting to password reset...",
        duration: 3000,
      });
      router.push("/reset-password");
    },
    onError: (error) => {
      toast.error("Verification failed", {
        description: error.message,
        duration: 5000,
      });
    },
  });

  const handleSubmitEmail = (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Email required", {
        description: "Please enter your email address",
      });
      return;
    }

    sendOtpMutation.mutate(email);
  };

  const handleSubmitOtp = (e) => {
    e.preventDefault();

    if (!otp.trim()) {
      toast.error("OTP required", {
        description: "Please enter the OTP from your email",
      });
      return;
    }

    verifyOtpMutation.mutate({ email, otp });
  };

  const handleResendOtp = () => {
    setOtp("");
    sendOtpMutation.mutate(email);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link
            href="/login"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Login
          </Link>
          <h1 className="text-3xl font-bold text-purple-700 mb-2">
            Reset Password
          </h1>
          <p className="text-gray-600">
            {step === "email"
              ? "Enter your email to receive an OTP"
              : "Enter the OTP sent to your email"}
          </p>
        </div>

        <Card className="shadow-lg border-gray-200">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center text-gray-900">
              {step === "email" ? "Forgot Password?" : "Verify OTP"}
            </CardTitle>
            <CardDescription className="text-center">
              {step === "email"
                ? "We'll send you an OTP to reset your password"
                : "Use the OTP from your email to proceed"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={step === "email" ? handleSubmitEmail : handleSubmitOtp}
              className="space-y-4"
            >
              {(sendOtpMutation.error || verifyOtpMutation.error) && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {sendOtpMutation.error?.message ||
                      verifyOtpMutation.error?.message}
                  </AlertDescription>
                </Alert>
              )}

              {step === "email" ? (
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (sendOtpMutation.error) {
                          sendOtpMutation.reset();
                        }
                      }}
                      className="pl-10 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                      required
                      disabled={sendOtpMutation.isPending}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="otp">OTP</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="otp"
                        name="otp"
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        onChange={(e) => {
                          setOtp(e.target.value);
                          if (verifyOtpMutation.error) {
                            verifyOtpMutation.reset();
                          }
                        }}
                        className="pl-10 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                        maxLength={6}
                        required
                        disabled={verifyOtpMutation.isPending}
                      />
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    Sent to: <span className="font-medium">{email}</span>
                  </div>
                </>
              )}

              <Button
                type="submit"
                className="w-full bg-purple-700 hover:bg-purple-600 text-white transition-colors"
                disabled={
                  sendOtpMutation.isPending || verifyOtpMutation.isPending
                }
              >
                {sendOtpMutation.isPending || verifyOtpMutation.isPending ? (
                  <>
                    <LoadingSpinner className="mr-2 h-4 w-4" />
                    {step === "email" ? "Sending OTP..." : "Verifying..."}
                  </>
                ) : step === "email" ? (
                  "Send OTP"
                ) : (
                  "Verify OTP"
                )}
              </Button>

              {step === "otp" && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-gray-300 text-purple-700 hover:bg-purple-50 transition-colors"
                  onClick={handleResendOtp}
                  disabled={sendOtpMutation.isPending}
                >
                  {sendOtpMutation.isPending ? (
                    <>
                      <LoadingSpinner className="mr-2 h-4 w-4" />
                      Resending...
                    </>
                  ) : (
                    "Resend OTP"
                  )}
                </Button>
              )}
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Remember your password?{" "}
                <Link
                  href="/login"
                  className="text-purple-600 hover:text-purple-700 hover:underline font-medium transition-colors"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
