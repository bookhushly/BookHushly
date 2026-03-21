// Skeleton shown while search results load — no JS deps, pure CSS animate-pulse
export default function SearchLoading() {
  return (
    <div className="min-h-screen bg-gray-50 pt-24 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Search bar skeleton */}
        <div className="h-12 bg-gray-200 rounded-xl animate-pulse mb-6 max-w-2xl" />

        {/* Filter row skeleton */}
        <div className="flex gap-3 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-9 w-24 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>

        {/* Result cards skeleton grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
              {/* Image area */}
              <div className="h-48 bg-gray-200 animate-pulse" />
              {/* Content */}
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
                <div className="flex justify-between items-center pt-2">
                  <div className="h-5 bg-gray-200 rounded animate-pulse w-1/3" />
                  <div className="h-8 bg-gray-200 rounded-lg animate-pulse w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
