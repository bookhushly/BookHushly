import {
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  Shield,
  XCircle,
} from "lucide-react";

const CancellationPolicyDisplay = ({ cancellationPolicy }) => {
  // Policy mapping with better user experience
  const policyMap = {
    no_refunds: {
      icon: <XCircle className="w-4 h-4 text-red-500" />,
      title: "No Refunds",
      description: "Payments are non-refundable once booking is confirmed",
      severity: "strict",
    },
    no_refund: {
      icon: <XCircle className="w-4 h-4 text-red-500" />,
      title: "No Refunds",
      description: "Payments are non-refundable once booking is confirmed",
      severity: "strict",
    },
    flexible: {
      icon: <CheckCircle className="w-4 h-4 text-green-500" />,
      title: "Flexible Cancellation",
      description: "Free cancellation up to 24 hours before your booking",
      severity: "flexible",
    },
    moderate: {
      icon: <Clock className="w-4 h-4 text-yellow-500" />,
      title: "Moderate Cancellation",
      description: "Free cancellation up to 5 days before your booking",
      severity: "moderate",
    },
    strict: {
      icon: <XCircle className="w-4 h-4 text-red-500" />,
      title: "Strict Cancellation",
      description: "Non-refundable except in special circumstances",
      severity: "strict",
    },
    "24h_cancellation": {
      icon: <Clock className="w-4 h-4 text-blue-500" />,
      title: "24 Hour Notice Required",
      description: "Free cancellation up to 24 hours before your booking",
      severity: "moderate",
    },
    "48h_cancellation": {
      icon: <Clock className="w-4 h-4 text-blue-500" />,
      title: "48 Hour Notice Required",
      description: "Free cancellation up to 48 hours before your booking",
      severity: "moderate",
    },
    partial_refund: {
      icon: <RefreshCw className="w-4 h-4 text-yellow-500" />,
      title: "Partial Refund Available",
      description: "Partial refunds may be available depending on timing",
      severity: "moderate",
    },
  };

  const normalizePolicy = (policy) => {
    return policy
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^\w_]/g, "");
  };

  const getPolicyDetails = (policy) => {
    const normalized = normalizePolicy(policy);

    // Check for time-based patterns
    if (policy.includes("24") || policy.includes("24h")) {
      return policyMap["24h_cancellation"];
    }
    if (policy.includes("48") || policy.includes("48h")) {
      return policyMap["48h_cancellation"];
    }

    // Check mapped policies
    if (policyMap[normalized]) {
      return policyMap[normalized];
    }

    // Fallback for unmapped policies
    return {
      icon: <Shield className="w-4 h-4 text-gray-500" />,
      title: policy.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      description: "Contact the service provider for specific details",
      severity: "moderate",
    };
  };

  const getSeverityStyle = (severity) => {
    const styles = {
      flexible: "bg-green-50 border-green-200",
      moderate: "bg-yellow-50 border-yellow-200",
      strict: "bg-red-50 border-red-200",
    };
    return styles[severity] || styles.moderate;
  };

  // Normalize and deduplicate policies
  const policies = Array.isArray(cancellationPolicy)
    ? [...new Set(cancellationPolicy.filter((p) => p && p.trim()))]
    : cancellationPolicy
      ? [cancellationPolicy]
      : [];

  if (policies.length === 0) return null;

  return (
    <div>
      <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
        <Shield className="w-4 h-4 mr-2" />
        Cancellation Policy
      </h3>

      <div className="space-y-3">
        {policies.map((policy, index) => {
          const details = getPolicyDetails(policy);

          return (
            <div
              key={index}
              className={`p-4 rounded-lg border ${getSeverityStyle(details.severity)}`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">{details.icon}</div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">
                    {details.title}
                  </h4>
                  <p className="text-sm text-gray-600">{details.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-blue-700">
            <strong>Note:</strong> Contact the service provider for specific
            questions about cancellation terms.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CancellationPolicyDisplay;
