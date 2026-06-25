'use client'
import { Toaster } from 'react-hot-toast'

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      gutter={8}
      toastOptions={{
        duration: 4000,
        style: {
          borderRadius: '16px',
          background: '#fff',
          color: '#1f2937',
          boxShadow: '0 4px 30px rgba(194,24,91,0.12)',
          padding: '12px 16px',
          fontSize: '14px',
        },
        success: { iconTheme: { primary: '#C2185B', secondary: '#fff' } },
        error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
      }}
    />
  )
}
