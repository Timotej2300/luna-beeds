'use client'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  page: number
  total: number
  perPage?: number
  onPageChange: (p: number) => void
}

export default function Pagination({ page, total, perPage = 12, onPageChange }: Props) {
  const pages = Math.ceil(total / perPage)
  if (pages <= 1) return null
  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button disabled={page <= 1} onClick={() => onPageChange(page - 1)}
        className="p-2 rounded-xl bg-white shadow-soft text-gray-400 hover:text-[#C2185B] disabled:opacity-30 transition-colors"
      ><ChevronLeft className="w-5 h-5" /></button>
      {[...Array(pages)].map((_, i) => (
        <button key={i} onClick={() => onPageChange(i + 1)}
          className={`w-10 h-10 rounded-xl font-medium transition-all ${page === i + 1 ? 'bg-[#C2185B] text-white shadow-soft' : 'bg-white text-gray-500 shadow-soft hover:bg-[#FFF0F7] hover:text-[#C2185B]'}`}
        >{i + 1}</button>
      ))}
      <button disabled={page >= pages} onClick={() => onPageChange(page + 1)}
        className="p-2 rounded-xl bg-white shadow-soft text-gray-400 hover:text-[#C2185B] disabled:opacity-30 transition-colors"
      ><ChevronRight className="w-5 h-5" /></button>
    </div>
  )
}
