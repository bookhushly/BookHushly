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
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuthStore } from "@/lib/store";
import { signUp } from "@/lib/auth";
import { createUserProfile } from "@/lib/database";
import { createClient } from "@supabase/supabase-js";
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

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

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
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { user } = useAuthStore();

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

  // Password requirements validation
  const passwordRequirements = {
    minLength: formData.password.length >= 8,
    hasUppercase: /[A-Z]/.test(formData.password),
    hasLowercase: /[a-z]/.test(formData.password),
    hasNumber: /\d/.test(formData.password),
    hasSpecialChar: /[@$!%*?&]/.test(formData.password),
  };

  // Check if email already exists in the database
  const checkEmailExists = async (email) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("email")
        .eq("email", email.trim())
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error checking email:", error);
        return false;
      }

      return !!data;
    } catch (err) {
      console.error("Unexpected error checking email:", err);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      // Check if email already exists
      const emailExists = await checkEmailExists(formData.email);
      if (emailExists) {
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
        setLoading(false);
        return;
      }

      const userData = {
        name: formData.name.trim(),
        role: formData.role,
      };

      const { data, error: signUpError } = await signUp(
        formData.email,
        formData.password,
        userData
      );

      if (signUpError) {
        toast.error(signUpError.message, {
          position: "top-center",
          style: {
            background: "#fee2e2",
            color: "#b91c1c",
            border: "1px solid #b91c1c",
          },
        });
        setLoading(false);
        return;
      }

      if (data.user) {
        const profileData = {
          id: data.user.id,
          email: data.user.email,
          name: formData.name.trim(),
          role: formData.role,
          created_at: new Date().toISOString(),
        };

        const { error: profileError } = await createUserProfile(profileData);

        if (profileError) {
          console.error("Profile creation error:", profileError);
          // Proceed despite profile error
        }

        setIsSuccess(true);
      }
    } catch (err) {
      toast.error("An unexpected error occurred", {
        position: "top-center",
        style: {
          background: "#fee2e2",
          color: "#b91c1c",
          border: "1px solid #b91c1c",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <Toaster />
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-primary mb-2">
            Join Bookhushly
          </h1>
          <p className="text-muted-foreground">
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
                  <p className="text-sm text-muted-foreground mb-4">
                    A verification email has been sent to {formData.email}.
                    Please check your inbox to verify your account.
                  </p>
                  <div className="grid grid-cols-1 gap-4 w-full">
                    <div className="flex items-center gap-2 bg-muted p-3 rounded-lg">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        Name: {formData.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 bg-muted p-3 rounded-lg">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        Email: {formData.email}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 bg-muted p-3 rounded-lg">
                      <Building
                        className="h-5 w-5 text-muted-foreground"
                        style={
                          formData.role === "customer"
                            ? { display: "none" }
                            : {}
                        }
                      />
                      <ShoppingBag
                        className="h-5 w-5 text-muted-foreground"
                        style={
                          formData.role === "vendor" ? { display: "none" } : {}
                        }
                      />
                      <span className="text-sm font-medium">
                        Role:{" "}
                        {formData.role === "customer" ? "Customer" : "Vendor"}
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  className="w-full bg-primary hover:bg-primary/90"
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
                <p className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="text-primary hover:underline font-medium"
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
                    <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <RadioGroupItem value="customer" id="customer" />
                      <Label
                        htmlFor="customer"
                        className="flex items-center cursor-pointer flex-1"
                      >
                        <ShoppingBag className="h-4 w-4 mr-2 text-primary" />
                        <div>
                          <div className="font-medium">Book Services</div>
                          <div className="text-xs text-muted-foreground">
                            Find and book hospitality, logistics & security
                            services
                          </div>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <RadioGroupItem value="vendor" id="vendor" />
                      <Label
                        htmlFor="vendor"
                        className="flex items-center cursor-pointer flex-1"
                      >
                        <Building className="h-4 w-4 mr-2 text-primary" />
                        <div>
                          <div className="font-medium">Provide Services</div>
                          <div className="text-xs text-muted-foreground">
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
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
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
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
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
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
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
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
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
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
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
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
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
                <p className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="text-primary hover:underline font-medium"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            )}

            <div className="mt-6 text-center">
              <p className="text-xs text-muted-foreground">
                By creating an account, you agree to our{" "}
                <Link href="/terms" className="text-primary hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-primary hover:underline">
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
