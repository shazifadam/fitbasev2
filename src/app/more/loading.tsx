import { Skeleton } from '@/components/ui/skeleton'

export default function MoreLoading() {
  return (
    <main className="min-h-screen bg-neutral-100 pb-24">
      <div className="flex flex-col gap-6 px-4 pt-12 pb-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-8 w-16" />
        </div>

        {/* Profile card */}
        <Skeleton className="h-20 w-full" />

        {/* Section label */}
        <Skeleton className="h-3 w-24" />

        {/* Menu items */}
        <Skeleton className="h-40 w-full" />

        {/* Section label */}
        <Skeleton className="h-3 w-10" />

        {/* Menu items */}
        <Skeleton className="h-28 w-full" />

        {/* Logout */}
        <Skeleton className="h-[52px] w-full" />
      </div>
    </main>
  )
}
