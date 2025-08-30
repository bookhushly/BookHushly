"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { verifyOtpAndRedirect } from "@/lib/auth";
import { Lock, ArrowLeft, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState(""); // Pre-filled from localStorage or query if available
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Optionally pre-fill email from localStorage or query params if passed
    const storedEmail = localStorage.getItem("resetEmail") || "";
    if (storedEmail) setEmail(storedEmail);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!otp.trim() || !email.trim()) {
      setError("Email and OTP are required");
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

      setSuccess(true);
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

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-lg text-center">
            <CardHeader>
              <div className="mx-auto mb-4 text-green-500">
                <CheckCircle className="h-16 w-16" />
              </div>
              <CardTitle className="text-2xl">OTP Verified</CardTitle>
              <CardDescription>You can now reset your password</CardDescription>
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
            href="/forgot-password"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Forgot Password
          </Link>
          <h1 className="text-3xl font-bold text-primary mb-2">Verify OTP</h1>
          <p className="text-muted-foreground">
            Enter the OTP sent to your email
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Enter OTP</CardTitle>
            <CardDescription className="text-center">
              Use the OTP from your email to proceed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>

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
                    onChange={(e) => setOtp(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <LoadingSpinner className="mr-2 h-4 w-4" />
                    Verifying OTP...
                  </>
                ) : (
                  "Verify OTP"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
