import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export function useImageUpload(bucket = 'product-images') {
  const [uploading, setUploading] = useState(false)

  const upload = async (file: File): Promise<string | null> => {
    setUploading(true)
    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop()
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage.from(bucket).upload(path, file)
      if (error) { toast.error('Upload zlyhal'); return null }
      const { data } = supabase.storage.from(bucket).getPublicUrl(path)
      return data.publicUrl
    } finally {
      setUploading(false)
    }
  }

  return { upload, uploading }
}
