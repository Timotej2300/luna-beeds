'use client'
import { useRef } from 'react'
import { Upload, X } from 'lucide-react'
import Image from 'next/image'
import { useImageUpload } from '@/hooks/useImageUpload'
import toast from 'react-hot-toast'

interface Props {
  value: string[]
  onChange: (urls: string[]) => void
  max?: number
}

export default function ImageUploader({ value, onChange, max = 5 }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const { upload, uploading } = useImageUpload('product-images')

  const handleFiles = async (files: FileList) => {
    if (value.length + files.length > max) { toast.error(`Max ${max} obrázkov`); return }
    const urls: string[] = []
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) { toast.error('Len obrázky!'); continue }
      const url = await upload(file)
      if (url) urls.push(url)
    }
    onChange([...value, ...urls])
  }

  return (
    <div>
      <div className="grid grid-cols-4 gap-3 mb-3">
        {value.map((url, i) => (
          <div key={i} className="relative aspect-square rounded-2xl overflow-hidden group">
            <Image src={url} alt={`img-${i}`} fill className="object-cover" />
            <button onClick={() => onChange(value.filter((_, j) => j !== i))}
              className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            ><X className="w-3 h-3" /></button>
          </div>
        ))}
        {value.length < max && (
          <button type="button" onClick={() => inputRef.current?.click()}
            className="aspect-square rounded-2xl border-2 border-dashed border-[#FFB6D9] hover:border-[#C2185B] flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-[#C2185B] transition-colors"
            disabled={uploading}
          >
            <Upload className="w-5 h-5" />
            <span className="text-xs">{uploading ? 'Nahrávam...' : 'Pridať'}</span>
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden"
        onChange={e => e.target.files && handleFiles(e.target.files)} />
    </div>
  )
}
