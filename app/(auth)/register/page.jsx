"use client";

import { useState, useEffect, useTransition } from "react";
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
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Toaster, toast } from "react-hot-toast";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowLeft,
  Building,
  ShoppingBag,
  CheckCircle,
  Check,
  X,
} from "lucide-react";
import { signup } from "./actions";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleRoleChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      role: value,
    }));
  };

  const validateForm = () => {
    const { name, email, password, confirmPassword, role } = formData;

    if (!role) {
      toast.error("Please select a role", {
        position: "top-center",
        style: {
          background: "#fee2e2",
          color: "#b91c1c",
          border: "1px solid #b91c1c",
        },
      });
      return false;
    }
    if (!name.trim()) {
      toast.error("Name is required", {
        position: "top-center",
        style: {
          background: "#fee2e2",
          color: "#b91c1c",
          border: "1px solid #b91c1c",
        },
      });
      return false;
    }
    if (!email.trim()) {
      toast.error("Email is required", {
        position: "top-center",
        style: {
          background: "#fee2e2",
          color: "#b91c1c",
          border: "1px solid #b91c1c",
        },
      });
      return false;
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!password) {
      toast.error("Password is required", {
        position: "top-center",
        style: {
          background: "#fee2e2",
          color: "#b91c1c",
          border: "1px solid #b91c1c",
        },
      });
      return false;
    }
    if (!passwordRegex.test(password)) {
      toast.error(
        "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)",
        {
          position: "top-center",
          style: {
            background: "#fee2e2",
            color: "#b91c1c",
            border: "1px solid #b91c1c",
          },
        }
      );
      return false;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match", {
        position: "top-center",
        style: {
          background: "#fee2e2",
          color: "#b91c1c",
          border: "1px solid #b91c1c",
        },
      });
      return false;
    }
    return true;
  };

  const passwordRequirements = {
    minLength: formData.password.length >= 8,
    hasUppercase: /[A-Z]/.test(formData.password),
    hasLowercase: /[a-z]/.test(formData.password),
    hasNumber: /\d/.test(formData.password),
    hasSpecialChar: /[@$!%*?&]/.test(formData.password),
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    startTransition(async () => {
      const result = await signup({ formData });

      if (result.ok) {
        setIsSuccess(true);
      } else if (result.code) {
        switch (result.code) {
          case "EMAIL_ALREADY_EXISTS":
            toast.error(
              "This email is already registered. Please use a different email or sign in.",
              {
                position: "top-center",
                style: {
                  background: "#fee2e2",
                  color: "#b91c1c",
                  border: "1px solid #b91c1c",
                },
              }
            );
            break;
          default:
            toast.error("Something went wrong. Please try again.", {
              position: "top-center",
              style: {
                background: "#fee2e2",
                color: "#b91c1c",
                border: "1px solid #b91c1c",
              },
            });
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Toaster />
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-purple-600 mb-2">
            Join Bookhushly
          </h1>
          <p className="text-gray-600">
            Create your account and start connecting
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              {isSuccess ? "Registration Successful" : "Create Account"}
            </CardTitle>
            <CardDescription className="text-center">
              {isSuccess
                ? "Your account has been created. Please verify your email."
                : "Choose your role and get started"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSuccess ? (
              <div className="space-y-6">
                <div className="flex flex-col items-center text-center">
                  <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900">
                    Welcome, {formData.name}!
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    A verification email has been sent to {formData.email}.
                    Please check your inbox to verify your account.
                  </p>
                  <div className="grid grid-cols-1 gap-4 w-full">
                    <div className="flex items-center gap-2 bg-gray-100 p-3 rounded-lg">
                      <User className="h-5 w-5 text-gray-600" />
                      <span className="text-sm font-medium">
                        Name: {formData.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-100 p-3 rounded-lg">
                      <Mail className="h-5 w-5 text-gray-600" />
                      <span className="text-sm font-medium">
                        Email: {formData.email}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-100 p-3 rounded-lg">
                      {formData.role === "customer" ? (
                        <ShoppingBag className="h-5 w-5 text-gray-600" />
                      ) : (
                        <Building className="h-5 w-5 text-gray-600" />
                      )}
                      <span className="text-sm font-medium">
                        Role:{" "}
                        {formData.role === "customer" ? "Customer" : "Vendor"}
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  onClick={() => {
                    setIsSuccess(false);
                    setFormData({
                      name: "",
                      email: "",
                      password: "",
                      confirmPassword: "",
                      role: "",
                    });
                  }}
                >
                  Register Another Account
                </Button>
                <p className="text-sm text-gray-600 text-center">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="text-purple-600 hover:underline font-medium"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>I want to:</Label>
                  <RadioGroup
                    value={formData.role}
                    onValueChange={handleRoleChange}
                  >
                    <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <RadioGroupItem value="customer" id="customer" />
                      <Label
                        htmlFor="customer"
                        className="flex items-center cursor-pointer flex-1"
                      >
                        <ShoppingBag className="h-4 w-4 mr-2 text-purple-600" />
                        <div>
                          <div className="font-medium">Book Services</div>
                          <div className="text-xs text-gray-600">
                            Find and book hospitality, logistics & security
                            services
                          </div>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <RadioGroupItem value="vendor" id="vendor" />
                      <Label
                        htmlFor="vendor"
                        className="flex items-center cursor-pointer flex-1"
                      >
                        <Building className="h-4 w-4 mr-2 text-purple-600" />
                        <div>
                          <div className="font-medium">Provide Services</div>
                          <div className="text-xs text-gray-600">
                            List your business and accept bookings
                          </div>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-600" />
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-600" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-600" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={handleChange}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-600 hover:text-gray-900"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex items-center">
                      {passwordRequirements.minLength ? (
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                      ) : (
                        <X className="h-4 w-4 text-red-500 mr-2" />
                      )}
                      At least 8 characters
                    </div>
                    <div className="flex items-center">
                      {passwordRequirements.hasUppercase ? (
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                      ) : (
                        <X className="h-4 w-4 text-red-500 mr-2" />
                      )}
                      At least one uppercase letter
                    </div>
                    <div className="flex items-center">
                      {passwordRequirements.hasLowercase ? (
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                      ) : (
                        <X className="h-4 w-4 text-red-500 mr-2" />
                      )}
                      At least one lowercase letter
                    </div>
                    <div className="flex items-center">
                      {passwordRequirements.hasNumber ? (
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                      ) : (
                        <X className="h-4 w-4 text-red-500 mr-2" />
                      )}
                      At least one number
                    </div>
                    <div className="flex items-center">
                      {passwordRequirements.hasSpecialChar ? (
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                      ) : (
                        <X className="h-4 w-4 text-red-500 mr-2" />
                      )}
                      At least one special character (@$!%*?&)
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-600" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-3 text-gray-600 hover:text-gray-900"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <LoadingSpinner className="mr-2 h-4 w-4" />
                      Creating Account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>
            )}

            {!isSuccess && (
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="text-purple-600 hover:underline font-medium"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            )}

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-600">
                By creating an account, you agree to our{" "}
                <Link href="/terms" className="text-purple-600 hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="text-purple-600 hover:underline"
                >
                  Privacy Policy
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
