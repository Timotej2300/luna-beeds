import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

interface Crumb { label: string; href?: string }

export default function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav className="flex items-center gap-1 text-sm text-gray-400 mb-6">
      <Link href="/" className="hover:text-[#C2185B] transition-colors"><Home className="w-4 h-4" /></Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          <ChevronRight className="w-4 h-4" />
          {item.href && i < items.length - 1
            ? <Link href={item.href} className="hover:text-[#C2185B] transition-colors">{item.label}</Link>
            : <span className="text-gray-600 font-medium">{item.label}</span>
          }
        </span>
      ))}
    </nav>
  )
}
