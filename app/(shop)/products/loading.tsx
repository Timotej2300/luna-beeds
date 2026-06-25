export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="h-8 w-64 bg-gradient-to-r from-gray-100 via-pink-50 to-gray-100 rounded-2xl animate-pulse mb-8" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-3xl shadow-soft overflow-hidden border border-pink-50">
            <div className="h-64 bg-gradient-to-br from-[#FFF0F7] to-[#FFD6EC] animate-pulse" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-100 rounded-xl animate-pulse w-3/4" />
              <div className="h-4 bg-gray-100 rounded-xl animate-pulse w-1/2" />
              <div className="h-9 bg-gray-100 rounded-2xl animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
