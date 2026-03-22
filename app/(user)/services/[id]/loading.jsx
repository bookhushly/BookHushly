// Shimmer skeleton shown by Next.js while the service detail page loads
export default function ServiceDetailLoading() {
  return (
    <div className="min-h-screen bg-gray-50 animate-pulse">
      {/* Sticky header placeholder */}
      <div className="sticky top-0 z-40 bg-white/95 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="h-5 w-24 bg-gray-200 rounded" />
          <div className="flex gap-2">
            <div className="h-9 w-9 bg-gray-200 rounded-full" />
            <div className="h-9 w-9 bg-gray-200 rounded-full" />
          </div>
        </div>
      </div>

      {/* Hero image */}
      <div className="h-[55vh] md:h-[70vh] bg-gray-200" />

      {/* Content grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        <div className="grid lg:grid-cols-12 gap-6 md:gap-8">
          {/* Left column */}
          <div className="lg:col-span-8 space-y-6">
            {/* About section */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 space-y-3">
              <div className="h-6 w-40 bg-gray-200 rounded" />
              <div className="h-4 w-full bg-gray-200 rounded" />
              <div className="h-4 w-5/6 bg-gray-200 rounded" />
              <div className="h-4 w-4/6 bg-gray-200 rounded" />
            </div>
            {/* Details section */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 space-y-4">
              <div className="h-6 w-48 bg-gray-200 rounded" />
              <div className="grid sm:grid-cols-2 gap-4">
                {[0,1,2,3].map(i => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full shrink-0" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-20 bg-gray-200 rounded" />
                      <div className="h-3 w-32 bg-gray-200 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 space-y-4 sticky top-24">
              <div className="h-5 w-32 bg-gray-200 rounded" />
              {/* Countdown placeholder */}
              <div className="rounded-2xl overflow-hidden border border-gray-100">
                <div className="h-8 bg-gray-200" />
                <div className="h-16 bg-gray-100 flex gap-2 items-center justify-center">
                  {[0,1,2,3].map(i => (
                    <div key={i} className="w-10 h-10 bg-gray-200 rounded-xl" />
                  ))}
                </div>
              </div>
              {/* Ticket packages */}
              {[0,1].map(i => (
                <div key={i} className="border border-gray-200 rounded-xl p-4 space-y-2">
                  <div className="h-4 w-24 bg-gray-200 rounded" />
                  <div className="h-6 w-20 bg-gray-200 rounded" />
                  <div className="h-3 w-16 bg-gray-200 rounded" />
                </div>
              ))}
              <div className="h-12 w-full bg-gray-200 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
