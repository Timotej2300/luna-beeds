import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'https://lunabeeds.sk'
  const supabase = await createClient()
  const { data: products } = await supabase.from('products').select('slug,updated_at').eq('is_active', true)
  const { data: categories } = await supabase.from('categories').select('slug').eq('is_active', true)

  const staticRoutes = ['', '/products', '/categories', '/custom-bracelet', '/o-nas', '/contact', '/faq', '/gdpr', '/obchodne-podmienky', '/reklamacie']
    .map(route => ({ url: `${base}${route}`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: route === '' ? 1 : 0.8 }))

  const productRoutes = (products || []).map(p => ({
    url: `${base}/products/${p.slug}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  const categoryRoutes = (categories || []).map(c => ({
    url: `${base}/categories/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [...staticRoutes, ...productRoutes, ...categoryRoutes]
}
