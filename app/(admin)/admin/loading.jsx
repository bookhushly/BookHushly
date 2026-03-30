// Admin dashboard loading skeleton — pure CSS animate-pulse
export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Title + actions row */}
        <div className="flex items-center justify-between">
          <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-44" />
          <div className="flex gap-2">
            <div className="h-9 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            <div className="h-9 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/3" />
              <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2" />
            </div>
          ))}
        </div>

        {/* Data table skeleton */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
          {/* Table header */}
          <div className="flex gap-4 px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            {[40, 20, 15, 15, 10].map((w, i) => (
              <div key={i} className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" style={{ width: `${w}%` }} />
            ))}
          </div>
          {/* Table rows */}
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-gray-50 dark:border-gray-800 last:border-0">
              <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/3" />
              </div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-16" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20" />
              <div className="h-7 w-16 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
