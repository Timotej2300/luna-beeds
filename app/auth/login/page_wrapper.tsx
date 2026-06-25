import { Suspense } from 'react'
import LoginClient from './LoginClient'

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-[#FFF0F7] to-[#FFD6EC] flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#FFB6D9] border-t-[#C2185B] rounded-full animate-spin" /></div>}>
      <LoginClient />
    </Suspense>
  )
}
