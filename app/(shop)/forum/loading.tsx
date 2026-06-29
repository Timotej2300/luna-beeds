export default function ForumLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-8 h-10 w-48 animate-pulse rounded-lg bg-[#FFE9F3]" />

      <div className="mb-6 h-48 animate-pulse rounded-2xl bg-[#FFE9F3]" />

      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="mb-4 h-56 animate-pulse rounded-2xl bg-[#FFE9F3]/70"
        />
      ))}
    </div>
  );
}
