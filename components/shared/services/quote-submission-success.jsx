"use client";

import { CheckCircle2, Clock, Mail, Phone, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function SubmissionSuccess({
  serviceType = "logistics",
  user,
  onViewRequests,
  onNewRequest,
}) {
  return (
    <div className="max-w-2xl mx-auto">
      <Card className="p-8 md:p-12">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
        </div>

        {/* Success Message */}
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            Request Submitted Successfully!
          </h2>
          <p className="text-gray-600 text-base md:text-lg">
            Thank you for your{" "}
            {serviceType === "logistics" ? "logistics" : "security"} service
            request.
          </p>
        </div>

        {/* What Happens Next */}
        <div className="bg-purple-50 border border-purple-100 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-600" />
            What happens next?
          </h3>
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                1
              </div>
              <div>
                <p className="text-sm text-gray-700">
                  <strong>Confirmation Email</strong> - You'll receive an email
                  confirmation with your request details within the next few
                  minutes.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                2
              </div>
              <div>
                <p className="text-sm text-gray-700">
                  <strong>Quote Preparation</strong> - Our team will review your
                  requirements and prepare a customized quote.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                3
              </div>
              <div>
                <p className="text-sm text-gray-700">
                  <strong>Quote Delivery</strong> - Within 24 hours, you'll
                  receive a detailed quote via email with a secure payment link.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Important Info Box */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-8">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <svg
                className="w-5 h-5 text-blue-600"
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
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-700">
                <strong className="text-blue-900">Important:</strong> Please
                check your spam/junk folder if you don't see our emails in your
                inbox.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="border-t pt-6 mb-8">
          <p className="text-sm text-gray-600 text-center mb-4">
            Need immediate assistance? Contact us directly:
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="mailto:support@bookhushly.com"
              className="inline-flex items-center justify-center gap-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              <Mail className="w-4 h-4" />
              support@bookhushly.com
            </a>
            <span className="hidden sm:block text-gray-300">|</span>
            <a
              href="tel:+234"
              className="inline-flex items-center justify-center gap-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              <Phone className="w-4 h-4" />
              Call Support
            </a>
          </div>
        </div>

        {/* Action Buttons */}
        {user && (
          <>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={onViewRequests}
                variant="outline"
                className="flex-1 h-12"
              >
                View My Requests
              </Button>
              <Button
                onClick={onNewRequest}
                className="flex-1 h-12 bg-purple-600 hover:bg-purple-700 text-white"
              >
                Submit Another Request
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {/* Reference Number */}
            <div className="mt-6 pt-6 border-t text-center">
              <p className="text-xs text-gray-500">
                Your request has been logged in our system. You can track its
                status in your dashboard.
              </p>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
