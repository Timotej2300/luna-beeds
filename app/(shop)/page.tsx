import HeroSection from '@/components/shop/HeroSection'
import FeaturedProducts from '@/components/shop/FeaturedProducts'
import CategoryGrid from '@/components/shop/CategoryGrid'
import CustomBraceletPromo from '@/components/shop/CustomBraceletPromo'
import NewsletterSection from '@/components/shop/NewsletterSection'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Luna&Beeds – Handmade šperky & naramky',
  description: 'Objavte kolekciu luxusných handmade šperkov a naramkov. Vytvorte si vlastný naramok na mieru.',
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CategoryGrid />
      <FeaturedProducts />
      <CustomBraceletPromo />
      <NewsletterSection />
    </>
  )
}
