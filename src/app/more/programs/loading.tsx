export default function Loading() {
  return (
    <main className="min-h-screen bg-neutral-100 pb-24">
      <div className="flex flex-col gap-6 px-4 pt-6 pb-6">
        <div className="h-10 w-20 rounded-base bg-neutral-200 animate-pulse" />
        <div className="h-9 w-56 rounded-base bg-neutral-200 animate-pulse" />
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-14 rounded-base bg-neutral-200 animate-pulse" />
          ))}
        </div>
      </div>
    </main>
  )
}
