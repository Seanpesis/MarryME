export default function Loading() {
  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto animate-pulse">
      {/* Header skeleton */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-stone-200 rounded-xl" />
          <div className="h-4 w-64 bg-stone-100 rounded-lg" />
        </div>
        <div className="h-10 w-32 bg-stone-200 rounded-xl" />
      </div>

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 border border-stone-100">
            <div className="w-10 h-10 bg-stone-200 rounded-xl mb-3" />
            <div className="h-6 w-16 bg-stone-200 rounded-lg mb-2" />
            <div className="h-3 w-24 bg-stone-100 rounded" />
          </div>
        ))}
      </div>

      {/* Content skeleton */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-stone-100 space-y-4">
          <div className="h-5 w-40 bg-stone-200 rounded-lg" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-stone-200 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-stone-200 rounded w-3/4" />
                <div className="h-3 bg-stone-100 rounded w-1/2" />
              </div>
              <div className="w-16 h-6 bg-stone-200 rounded-full" />
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl p-6 border border-stone-100 space-y-3">
          <div className="h-5 w-32 bg-stone-200 rounded-lg mb-4" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 bg-stone-100 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
