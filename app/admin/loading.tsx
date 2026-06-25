export default function AdminLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 bg-gray-100 rounded-2xl animate-pulse" />
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_,i) => <div key={i} className="h-32 bg-white rounded-3xl shadow-soft animate-pulse" />)}
      </div>
      <div className="bg-white rounded-3xl shadow-soft h-96 animate-pulse" />
    </div>
  )
}
