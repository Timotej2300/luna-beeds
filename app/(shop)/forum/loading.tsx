export default function ForumsLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-8 h-10 w-48 animate-pulse rounded-lg bg-[#FFE9F3]" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-32 animate-pulse rounded-2xl bg-[#FFE9F3]/70"
          />
        ))}
      </div>
    </div>
  );
}
