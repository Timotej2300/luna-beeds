import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'POS Pokladňa – Luna&Beeds',
  description: 'POS systém pre predajne Luna&Beeds',
}

export default function PosLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FFF8FB]">
      {children}
    </div>
  )
}
