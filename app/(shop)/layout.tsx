import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import CartSidebar from '@/components/shop/CartSidebar'
import AnnouncementBar from '@/components/layout/AnnouncementBar'
import { createClient } from '@/lib/supabase/server'

async function getAnnouncements() {
  try {
    const supabase = await createClient()
    const now = new Date().toISOString()
    const { data } = await supabase
      .from('announcements')
      .select('*')
      .eq('is_active', true)
      .or(`date_from.is.null,date_from.lte.${now}`)
      .or(`date_to.is.null,date_to.gte.${now}`)
      .order('type', { ascending: true })
    return data || []
  } catch { return [] }
}

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const announcements = await getAnnouncements()
  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementBar announcements={announcements} />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartSidebar />
    </div>
  )
}
