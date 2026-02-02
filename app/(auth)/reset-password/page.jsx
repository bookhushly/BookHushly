"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import { Eye, EyeOff, Lock, CheckCircle, Check, X } from "lucide-react";
import { toast } from "sonner";
import { updatePassword } from "@/app/actions/auth";
import { useAuthActions } from "@/hooks/use-auth";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { invalidateAuth } = useAuthActions();
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  const updatePasswordMutation = useMutation({
    mutationFn: async (password) => {
      const result = await updatePassword(password);
      if (result.error) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: () => {
      setSuccess(true);
      invalidateAuth();
      toast.success("Password updated successfully!", {
        description: "You can now sign in with your new password",
        duration: 5000,
      });
      setTimeout(() => router.push("/login"), 3000);
    },
    onError: (error) => {
      toast.error("Password reset failed", {
        description: error.message,
        duration: 5000,
      });
    },
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (updatePasswordMutation.error) {
      updatePasswordMutation.reset();
    }
  };

  // Password requirements validation
  const passwordRequirements = {
    minLength: formData.password.length >= 8,
    hasUppercase: /[A-Z]/.test(formData.password),
    hasLowercase: /[a-z]/.test(formData.password),
    hasNumber: /\d/.test(formData.password),
    hasSpecialChar: /[@$!%*?&]/.test(formData.password),
  };

  const allRequirementsMet = Object.values(passwordRequirements).every(Boolean);
  const passwordsMatch =
    formData.password === formData.confirmPassword &&
    formData.confirmPassword.length > 0;

  const validateForm = () => {
    if (!allRequirementsMet) {
      toast.error("Invalid password", {
        description: "Password must meet all requirements",
      });
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords don't match", {
        description: "Please make sure both passwords are identical",
      });
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    updatePasswordMutation.mutate(formData.password);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-lg text-center border-gray-200">
            <CardHeader>
              <div className="mx-auto mb-4 text-green-500">
                <CheckCircle className="h-16 w-16" />
              </div>
              <CardTitle className="text-2xl text-gray-900">
                Password Updated
              </CardTitle>
              <CardDescription>
                Your password has been successfully updated. Redirecting to
                login...
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                asChild
                className="w-full bg-purple-700 hover:bg-purple-600 text-white"
              >
                <Link href="/login">Go to Login</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-purple-700 mb-2">
            Reset Password
          </h1>
          <p className="text-gray-600">Enter your new password</p>
        </div>

        <Card className="shadow-lg border-gray-200">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center text-gray-900">
              New Password
            </CardTitle>
            <CardDescription className="text-center">
              Choose a strong password for your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {updatePasswordMutation.error && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {updatePasswordMutation.error.message}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-10 pr-10 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                    required
                    disabled={updatePasswordMutation.isPending}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {/* Password Requirements Feedback */}
                <div className="text-sm space-y-1 mt-3">
                  <div className="flex items-center">
                    {passwordRequirements.minLength ? (
                      <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    ) : (
                      <X className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                    )}
                    <span
                      className={
                        passwordRequirements.minLength
                          ? "text-green-600"
                          : "text-gray-600"
                      }
                    >
                      At least 8 characters
                    </span>
                  </div>
                  <div className="flex items-center">
                    {passwordRequirements.hasUppercase ? (
                      <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    ) : (
                      <X className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                    )}
                    <span
                      className={
                        passwordRequirements.hasUppercase
                          ? "text-green-600"
                          : "text-gray-600"
                      }
                    >
                      At least one uppercase letter
                    </span>
                  </div>
                  <div className="flex items-center">
                    {passwordRequirements.hasLowercase ? (
                      <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    ) : (
                      <X className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                    )}
                    <span
                      className={
                        passwordRequirements.hasLowercase
                          ? "text-green-600"
                          : "text-gray-600"
                      }
                    >
                      At least one lowercase letter
                    </span>
                  </div>
                  <div className="flex items-center">
                    {passwordRequirements.hasNumber ? (
                      <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    ) : (
                      <X className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                    )}
                    <span
                      className={
                        passwordRequirements.hasNumber
                          ? "text-green-600"
                          : "text-gray-600"
                      }
                    >
                      At least one number
                    </span>
                  </div>
                  <div className="flex items-center">
                    {passwordRequirements.hasSpecialChar ? (
                      <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    ) : (
                      <X className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                    )}
                    <span
                      className={
                        passwordRequirements.hasSpecialChar
                          ? "text-green-600"
                          : "text-gray-600"
                      }
                    >
                      At least one special character (@$!%*?&)
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="pl-10 pr-10 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                    required
                    disabled={updatePasswordMutation.isPending}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {formData.confirmPassword && (
                  <div className="flex items-center text-sm mt-2">
                    {passwordsMatch ? (
                      <>
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-green-600">Passwords match</span>
                      </>
                    ) : (
                      <>
                        <X className="h-4 w-4 text-red-500 mr-2" />
                        <span className="text-red-600">
                          Passwords don't match
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-purple-700 hover:bg-purple-600 text-white transition-colors"
                disabled={
                  updatePasswordMutation.isPending ||
                  !allRequirementsMet ||
                  !passwordsMatch
                }
              >
                {updatePasswordMutation.isPending ? (
                  <>
                    <LoadingSpinner className="mr-2 h-4 w-4" />
                    Updating Password...
                  </>
                ) : (
                  "Update Password"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
