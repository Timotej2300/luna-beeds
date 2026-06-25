import { cn } from '@/lib/utils'
export default function Spinner({ className }: { className?: string }) {
  return (
    <div className={cn('inline-flex items-center justify-center', className)}>
      <div className="w-6 h-6 border-2 border-[#FFB6D9] border-t-[#C2185B] rounded-full animate-spin" />
    </div>
  )
}
