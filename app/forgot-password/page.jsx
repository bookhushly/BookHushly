"use client";

import { useState } from "react";
import Link from "next/link";
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
import { resetPassword, verifyOtpAndRedirect } from "@/lib/auth";
import { Mail, ArrowLeft, CheckCircle, Lock } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState("email"); // 'email' or 'otp'

  const handleSubmitEmail = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { error } = await resetPassword(email);

      if (error) {
        setError(error.message);
        toast.error("Reset failed", {
          description: error.message,
        });
        return;
      }

      setStep("otp"); // Move to OTP verification step
      toast.success("OTP sent!", {
        description: `Check your email (${email}) for the OTP to reset your password`,
      });
    } catch (err) {
      setError("An unexpected error occurred");
      toast.error("Reset failed", {
        description: "An unexpected error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitOtp = async (e) => {
    e.preventDefault();

    if (!otp.trim()) {
      setError("OTP is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data, error } = await verifyOtpAndRedirect(email, otp);

      if (error) {
        setError(error.message);
        toast.error("OTP verification failed", {
          description: error.message,
        });
        return;
      }

      setStep("success"); // Move to success state
      toast.success("OTP verified!", {
        description: "You can now set a new password",
      });
      router.push("/reset-password");
    } catch (err) {
      setError("An unexpected error occurred");
      toast.error("OTP verification failed", {
        description: "An unexpected error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  if (step === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-lg text-center">
            <CardHeader>
              <div className="mx-auto mb-4 text-green-500">
                <CheckCircle className="h-16 w-16" />
              </div>
              <CardTitle className="text-2xl">OTP Verified</CardTitle>
              <CardDescription>
                You can now reset your password.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/reset-password">Reset Password</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link
            href="/login"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Login
          </Link>
          <h1 className="text-3xl font-bold text-primary mb-2">
            Reset Password
          </h1>
          <p className="text-muted-foreground">
            {step === "email"
              ? "Enter your email to receive an OTP"
              : "Enter the OTP sent to your email"}
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
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
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {step === "email" ? (
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError("");
                      }}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="otp">OTP</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="otp"
                      name="otp"
                      type="text"
                      placeholder="Enter OTP"
                      value={otp}
                      onChange={(e) => {
                        setOtp(e.target.value);
                        if (error) setError("");
                      }}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <LoadingSpinner className="mr-2 h-4 w-4" />
                    {step === "email" ? "Sending OTP..." : "Verifying OTP..."}
                  </>
                ) : step === "email" ? (
                  "Send OTP"
                ) : (
                  "Verify OTP"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {step === "email"
                  ? "Remember your password? "
                  : "Didn't receive the OTP? "}
                <Link
                  href={step === "email" ? "/login" : "/forgot-password"}
                  className="text-primary hover:underline font-medium"
                >
                  {step === "email" ? "Sign in here" : "Resend OTP"}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
