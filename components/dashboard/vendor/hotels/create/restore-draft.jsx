import { AlertCircle, RotateCcw, Trash2 } from "lucide-react";

export default function RestoreDraftModal({ onRestore, onDiscard, savedAt }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffMinutes < 1) return "just now";
    if (diffMinutes < 60)
      return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-purple-600" />
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Draft Found
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              We found an unsaved draft from{" "}
              <span className="font-medium text-gray-900">
                {formatDate(savedAt)}
              </span>
              . Would you like to restore it or start fresh?
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onRestore}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Restore Draft
              </button>

              <button
                onClick={onDiscard}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Start Fresh
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
