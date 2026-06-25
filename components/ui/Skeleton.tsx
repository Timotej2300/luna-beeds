import { cn } from '@/lib/utils'

interface SkeletonProps { className?: string }

export default function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn(
      'bg-gradient-to-r from-gray-100 via-pink-50 to-gray-100 bg-[length:200%_100%] animate-pulse rounded-2xl',
      className
    )} />
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-3xl shadow-soft overflow-hidden border border-pink-50">
      <Skeleton className="h-64 rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-8 w-full mt-2" />
      </div>
    </div>
  )
}

export function OrderRowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-gray-100">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-32 flex-1" />
      <Skeleton className="h-6 w-20 rounded-full" />
      <Skeleton className="h-4 w-16" />
    </div>
  )
}
