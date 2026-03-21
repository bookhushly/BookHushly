// Vendor dashboard loading skeleton — pure CSS animate-pulse
export default function VendorDashboardLoading() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <div className="h-7 bg-gray-200 rounded animate-pulse w-52" />
          <div className="h-9 w-32 bg-gray-200 rounded-lg animate-pulse" />
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3">
              <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
              <div className="h-9 bg-gray-200 rounded animate-pulse w-1/2" />
              <div className="h-2 bg-gray-200 rounded animate-pulse w-1/3" />
            </div>
          ))}
        </div>

        {/* Two-column content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bookings list */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <div className="h-5 bg-gray-200 rounded animate-pulse w-36" />
            </div>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-gray-50 last:border-0">
                <div className="h-10 w-10 rounded-xl bg-gray-200 animate-pulse shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
                </div>
                <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse" />
              </div>
            ))}
          </div>

          {/* Revenue chart area */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-4">
            <div className="h-5 bg-gray-200 rounded animate-pulse w-28" />
            <div className="h-40 bg-gray-100 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
