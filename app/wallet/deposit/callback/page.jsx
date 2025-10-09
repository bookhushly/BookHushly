// app/wallet/deposit/callback/page.jsx
// Deposit verification callback page

"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, XCircle, Loader } from "lucide-react";

export default function DepositCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("verifying");
  const [depositInfo, setDepositInfo] = useState(null);

  useEffect(() => {
    verifyDeposit();
  }, []);

  const verifyDeposit = async () => {
    const reference = searchParams.get("reference");

    if (!reference) {
      setStatus("error");
      return;
    }

    try {
      const response = await fetch("/api/wallet/deposit/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference }),
      });

      const result = await response.json();

      if (
        result.data?.status === "success" ||
        result.data?.status === "already_completed"
      ) {
        setStatus("success");
        setDepositInfo(result.data);

        // Redirect to wallet after 3 seconds
        setTimeout(() => {
          router.push("/dashboard/customer");
        }, 3000);
      } else {
        setStatus("failed");
        setDepositInfo(result.data);
      }
    } catch (error) {
      console.error("Verification error:", error);
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border-2 border-purple-100 p-12 max-w-md w-full text-center">
        {status === "verifying" && (
          <>
            <div className="mb-6">
              <div className="inline-flex items-center justify-center">
                <Loader className="h-16 w-16 text-purple-600 animate-spin" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Verifying Deposit
            </h2>
            <p className="text-gray-600">
              Please wait while we confirm your payment...
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Deposit Successful!
            </h2>
            {depositInfo?.amount && (
              <p className="text-lg font-semibold text-purple-600 mb-2">
                ₦{depositInfo.amount.toLocaleString()} added to your wallet
              </p>
            )}
            {depositInfo?.new_balance && (
              <p className="text-sm text-gray-600 mb-6">
                New balance: ₦{depositInfo.new_balance.toLocaleString()}
              </p>
            )}
            <p className="text-gray-600 mb-6">Redirecting to your wallet...</p>
            <div className="animate-pulse flex justify-center gap-2">
              <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
              <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
              <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
            </div>
          </>
        )}

        {status === "failed" && (
          <>
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-4">
                <XCircle className="h-12 w-12 text-red-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Deposit Failed
            </h2>
            <p className="text-gray-600 mb-6">
              Your deposit could not be completed. Please try again.
            </p>
            <button
              onClick={() => router.push("/dashboard/customer")}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-xl font-semibold transition-colors"
            >
              Back to Wallet
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-4">
                <XCircle className="h-12 w-12 text-red-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Verification Error
            </h2>
            <p className="text-gray-600 mb-6">
              Unable to verify your deposit. Please contact support if money was
              deducted.
            </p>
            <button
              onClick={() => router.push("/dashboard/customer")}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-xl font-semibold transition-colors"
            >
              Back to Wallet
            </button>
          </>
        )}
      </div>
    </div>
  );
}
