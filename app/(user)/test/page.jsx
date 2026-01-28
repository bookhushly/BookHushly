"use client";

import { useState } from "react";

export default function TestEmailPage() {
  const [formData, setFormData] = useState({
    to: "",
    templateName: "bookingConfirmation",
    data: JSON.stringify(
      {
        customerName: "John Doe",
        bookingReference: "BH123456",
        hotelName: "Sample Hotel",
        checkInDate: "2025-02-01",
        checkOutDate: "2025-02-03",
        roomType: "Deluxe Suite",
        totalAmount: "₦50,000",
      },
      null,
      2,
    ),
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: formData.to,
          templateName: formData.templateName,
          data: JSON.parse(formData.data),
        }),
      });

      const data = await response.json();
      setResult({ success: response.ok, data });
    } catch (error) {
      setResult({ success: false, data: { error: error.message } });
    } finally {
      setLoading(false);
    }
  };

  const templates = {
    bookingConfirmation: {
      customerName: "John Doe",
      bookingReference: "BH123456",
      hotelName: "Sample Hotel",
      checkInDate: "2025-02-01",
      checkOutDate: "2025-02-03",
      roomType: "Deluxe Suite",
      totalAmount: "₦50,000",
    },
    passwordReset: {
      resetLink: "https://bookhushly.com/reset-password?token=abc123",
      userName: "John Doe",
    },
    welcomeEmail: {
      userName: "John Doe",
      loginLink: "https://bookhushly.com/login",
    },
  };

  const handleTemplateChange = (templateName) => {
    setFormData({
      ...formData,
      templateName,
      data: JSON.stringify(templates[templateName] || {}, null, 2),
    });
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Email API Test
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* To Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recipient Email
            </label>
            <input
              type="email"
              required
              value={formData.to}
              onChange={(e) => setFormData({ ...formData, to: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="recipient@example.com"
            />
          </div>

          {/* Template Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Template
            </label>
            <select
              value={formData.templateName}
              onChange={(e) => handleTemplateChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="bookingConfirmation">Booking Confirmation</option>
              <option value="passwordReset">Password Reset</option>
              <option value="welcomeEmail">Welcome Email</option>
            </select>
          </div>

          {/* Template Data */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Template Data (JSON)
            </label>
            <textarea
              value={formData.data}
              onChange={(e) =>
                setFormData({ ...formData, data: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
              rows={12}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 disabled:bg-purple-300 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Sending..." : "Send Test Email"}
          </button>
        </form>

        {/* Result Display */}
        {result && (
          <div
            className={`mt-8 p-6 rounded-lg ${result.success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}
          >
            <h2
              className={`text-lg font-semibold mb-3 ${result.success ? "text-green-900" : "text-red-900"}`}
            >
              {result.success ? "✓ Success" : "✗ Error"}
            </h2>
            <pre className="bg-white p-4 rounded border overflow-auto text-sm">
              {JSON.stringify(result.data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
