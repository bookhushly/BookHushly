"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ServiceRequestSuccessModal({
  isOpen,
  onClose,
  requestType = "service",
  reference,
}) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!isOpen) return;

    // Auto-redirect after 5 seconds
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, router]);

  if (!isOpen) return null;

  const serviceTypeDisplay =
    requestType === "logistics"
      ? "Logistics Service"
      : requestType === "security"
        ? "Security Service"
        : "Service";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Purple gradient header */}
        <div className="h-2 bg-gradient-to-r from-purple-600 to-purple-400"></div>

        <div className="p-8">
          {/* Success icon with animation */}
          <div className="relative mx-auto w-20 h-20 mb-6">
            <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-75"></div>
            <div className="relative w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                className="w-12 h-12 text-green-600 animate-bounce"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                style={{ animationDuration: "1s" }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          {/* Success message */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Request Confirmed!
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Your{" "}
              <span className="font-semibold text-purple-600">
                {serviceTypeDisplay}
              </span>{" "}
              request has been successfully confirmed and payment received.
            </p>
          </div>

          {/* Reference badge */}
          {reference && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-purple-700 uppercase tracking-wide">
                  Reference
                </span>
                <span className="font-mono text-sm font-semibold text-purple-900">
                  {reference}
                </span>
              </div>
            </div>
          )}

          {/* What's next section */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-purple-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              What happens next?
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">•</span>
                <span>Our team will review your request within 24 hours</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">•</span>
                <span>You'll receive a confirmation email with details</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">•</span>
                <span>A BookHushly representative will contact you soon</span>
              </li>
            </ul>
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            <button
              onClick={() => router.push("/")}
              className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-purple-700 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
            >
              Go Back
            </button>
            <button
              onClick={onClose}
              className="w-full bg-white text-gray-700 py-3 px-6 rounded-lg font-medium border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all"
            >
              Close
            </button>
          </div>

          {/* Auto-redirect notice */}
          <p className="text-center text-xs text-gray-500 mt-4">
            Automatically redirecting to dashboard in {countdown}s
          </p>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100 rounded-full -mr-16 -mt-16 opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-100 rounded-full -ml-12 -mb-12 opacity-50"></div>
      </div>
    </div>
  );
}
