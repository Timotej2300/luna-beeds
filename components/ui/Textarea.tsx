import { cn } from '@/lib/utils'
import { forwardRef, TextareaHTMLAttributes } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, ...props }, ref) => (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <textarea
        ref={ref}
        className={cn(
          'w-full px-4 py-3 rounded-2xl border border-gray-200 outline-none resize-none',
          'focus:border-[#C2185B] focus:ring-2 focus:ring-[#FFB6D9]/30',
          'transition-all duration-200 text-gray-800 bg-white placeholder:text-gray-400',
          error && 'border-red-400',
          className
        )}
        rows={4}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
)
Textarea.displayName = 'Textarea'
export default Textarea
