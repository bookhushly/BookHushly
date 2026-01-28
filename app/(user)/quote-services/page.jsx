"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import LogisticsQuestionnaire from "@/components/shared/services/logistics-questionnaire";
import SecurityQuestionnaire from "@/components/shared/services/security-questionnaire";
import SubmissionSuccess from "@/components/shared/services/quote-submission-success";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCurrentUser } from "../../../hooks/use-auth";
import Loading from "@/components/common/loader";

const serviceFeatures = {
  logistics: [
    {
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
      title: "Fast Delivery",
      description:
        "Same-day and express delivery options available across Nigeria",
    },
    {
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      ),
      title: "Safe & Secure",
      description: "Insurance options and careful handling for your items",
    },
    {
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
      title: "Real-time Tracking",
      description: "Track your shipment from pickup to delivery",
    },
  ],
  security: [
    {
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
      title: "Trained Personnel",
      description: "Licensed and background-checked security professionals",
    },
    {
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      title: "24/7 Coverage",
      description: "Round-the-clock protection for your peace of mind",
    },
    {
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      ),
      title: "Risk Assessment",
      description: "Professional security evaluation and recommendations",
    },
  ],
};

export default function ServicesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") || "logistics",
  );
  const [showSuccess, setShowSuccess] = useState(false);
  const [successServiceType, setSuccessServiceType] = useState("");
  const { data: user, error, isLoading } = useCurrentUser();

  const handleSuccess = (serviceType) => {
    setSuccessServiceType(serviceType);
    setShowSuccess(true);
    // Scroll to top to show success message
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleViewRequests = () => {
    router.push("/dashboard/requests");
  };

  const handleNewRequest = () => {
    setShowSuccess(false);
    setSuccessServiceType("");
  };
  if (isLoading)
    return (
      <Loading
        text="Preparing Your Experience"
        animation="wave"
        fullScreen={true}
      />
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              <span className="text-sm font-medium">Back</span>
            </button>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-center mb-2">
            {showSuccess ? "Request Submitted" : "Request a Service"}
          </h1>
          <p className="text-gray-600 text-center text-sm md:text-base max-w-2xl mx-auto">
            {showSuccess
              ? "Your request has been received and is being processed"
              : "Choose between our logistics or security services. Fill out the questionnaire and we'll get back to you with a customized quote within 24 hours."}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 md:py-8">
        {showSuccess ? (
          // Success View
          <SubmissionSuccess
            serviceType={successServiceType}
            onViewRequests={handleViewRequests}
            onNewRequest={handleNewRequest}
            user={user}
          />
        ) : (
          // Questionnaire View
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            {/* Tab Switcher */}
            <div className="flex justify-center mb-6 md:mb-8">
              <TabsList className="grid w-full max-w-md grid-cols-2 h-auto bg-gray-100 p-1">
                <TabsTrigger
                  value="logistics"
                  className="data-[state=active]:bg-purple-600 data-[state=active]:text-white py-3 px-4 rounded-md transition-all"
                >
                  <div className="flex flex-col md:flex-row items-center gap-2">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                      />
                    </svg>
                    <div className="text-left">
                      <div className="font-semibold text-sm md:text-base">
                        Logistics
                      </div>
                    </div>
                  </div>
                </TabsTrigger>
                <TabsTrigger
                  value="security"
                  className="data-[state=active]:bg-purple-600 data-[state=active]:text-white py-3 px-4 rounded-md transition-all"
                >
                  <div className="flex flex-col md:flex-row items-center gap-2">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                    <div className="text-left">
                      <div className="font-semibold text-sm md:text-base">
                        Security
                      </div>
                    </div>
                  </div>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Logistics Tab */}
            <TabsContent value="logistics" className="mt-0">
              <div className="max-w-5xl mx-auto">
                {/* Feature Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
                  {serviceFeatures.logistics.map((feature, index) => (
                    <div
                      key={index}
                      className="bg-white p-4 rounded-lg border hover:border-purple-200 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <div className="text-purple-600">{feature.icon}</div>
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm mb-1">
                            {feature.title}
                          </h3>
                          <p className="text-xs text-gray-600">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Questionnaire */}
                <LogisticsQuestionnaire
                  onSuccess={() => handleSuccess("logistics")}
                />
              </div>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="mt-0">
              <div className="max-w-5xl mx-auto">
                {/* Feature Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
                  {serviceFeatures.security.map((feature, index) => (
                    <div
                      key={index}
                      className="bg-white p-4 rounded-lg border hover:border-purple-200 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <div className="text-purple-600">{feature.icon}</div>
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm mb-1">
                            {feature.title}
                          </h3>
                          <p className="text-xs text-gray-600">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Questionnaire */}
                <SecurityQuestionnaire
                  onSuccess={() => handleSuccess("security")}
                />
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
